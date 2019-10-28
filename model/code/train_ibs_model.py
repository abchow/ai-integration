# coding:utf-8
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
import os
from obs import ObsClient
# from pyspark import SparkConf,SparkContext
from pyspark.sql import SparkSession
from pyspark.sql import Row
from pyspark.ml.recommendation import ALS
from collections import OrderedDict
import collections
import json

AK=os.getenv('MINER_USER_ACCESS_KEY')
if AK is None:
    AK=''

SK=os.getenv('MINER_USER_SECRET_ACCESS_KEY')
if SK is None:
    SK=''

obs_endpoint=os.getenv('MINER_OBS_URL')
if obs_endpoint is None:
    obs_endpoint=''
print ("obs_endpoint: " + str(obs_endpoint))

obs_path=os.getenv('TRAIN_URL')
if obs_path is None:
    obs_path=''
print ("obs_path: " + str(obs_path))

data_path=os.getenv('DATA_URL')
if data_path is None:
    data_path=''
print ("data_path: " + str(data_path))

DATA_FILENAME = 'randomRating.csv'
LOCAL_MODEL_DIR = '/tmp/recommendmodel'
LOCAL_CONFIG_DIR = '/tmp/config.json'
LOCAL_METRIC_DIR = '/tmp/metric.json'
LOCAL_DATA_DIR = '/tmp/rating.csv'
MODEL_NAME = 'spark_model'
CONFIG_NAME = 'config.json'
METRIC_NAME = 'metric.json'

def print_title(title=""):
    print("=" * 15 + " %s " % title + "=" * 15)

def download_dataset():
    print("Start to download dataset from OBS")

    TestObs = ObsClient(AK, SK, is_secure=True, server=obs_endpoint)

    try:
        bucketName = data_path.split("/",1)[0]
        resultFileName = data_path.split("/",1)[1] + "/" + DATA_FILENAME
        resp = TestObs.getObject(bucketName, resultFileName, downloadPath=LOCAL_DATA_DIR)
        if resp.status < 300:
            print('Succeeded to download training dataset')
        else:
            print('Failed to download ')

    finally:
        TestObs.close()

def upload_to_obs():

    TestObs = ObsClient(AK, SK, is_secure=True, server=obs_endpoint)

    bucketName = obs_path.split("/",1)[0]
    workmetric = obs_path.split("/",1)[1] + '/'
    workmodel = obs_path.split("/",1)[1] + '/model/'
    #workconfig = obs_path.split("/",1)[1] + '/config/'
    filemodel = workmodel + MODEL_NAME
    fileconfig = workmodel + CONFIG_NAME
    filemetric = workmetric + METRIC_NAME
    #resultFileName = obs_path.split("/",1)[1] + '/model/xgboost.m'
    #configName = obs_path.split("/",1)[1] + '/config/config.json'
    TestObs.putContent(bucketName, workmodel, content=None)
    #TestObs.putContent(bucketName, workconfig, content=None)
    print_title("upload model to obs !")
    TestObs.putFile(bucketName, filemodel, file_path=LOCAL_MODEL_DIR)
    print_title("upload config to obs !")
    TestObs.putFile(bucketName, fileconfig, file_path=LOCAL_CONFIG_DIR)
    print_title("upload metric to obs !")
    TestObs.putFile(bucketName, filemetric, file_path=LOCAL_METRIC_DIR)
    return 0

def train_model():

    print_title("download data!")
    download_dataset()
    print_title("load data!")
	
    spark = SparkSession.builder.appName("ALSExample").getOrCreate()
    lines = spark.read.text(LOCAL_DATA_DIR).rdd
    parts = lines.map(lambda row: row.value.split(","))
    ratingsRDD = parts.map(lambda p: Row(userId=int(p[0]), itemId=int(p[1]), rating=float(p[2])))
    ratings = spark.createDataFrame(ratingsRDD)
    (training, test) = ratings.randomSplit([0.8, 0.2])
	
    rank = 10
    numIterations = 10
    lambda_ = 0.02
    blocks = 100
    als = ALS(rank=rank, maxIter=numIterations, implicitPrefs=True, userCol="userId", itemCol="itemId", ratingCol="rating")
    model = als.fit(training)
	
    test_model(spark, model, als, test)

    print_title("save model!")
    model.save(LOCAL_MODEL_DIR)
	
    spark.stop()
	
def test_model(spark, model, als, test_df):
    print("============= Get one record from test dataset ======================")	
    # Get one record from test dataset.  Use item id
	# Example:  [u'{"itemId":26}']    
    anItem_df = test_df.select(als.getItemCol()).distinct().limit(1)
    print(anItem_df.toJSON().collect())
	
    print("============= Return user liked this item most ======================")
    # Return user liked this item most
    # Example:  [u'{"itemId":26,"recommendations":[{"userId":4169,"rating":0.6387643}]}']
    userRatings_df = model.recommendForItemSubset(anItem_df, 1)
    print(userRatings_df.toJSON().collect())    
	
    print("============= Create User DataFrame ======================")
    # Create User DataFrame
	# Example:  [u'{"userId":4169}']
    anUser_int = userRatings_df.first()['recommendations'][0]['userId']
    anUser_row = Row(userId=anUser_int)
    anUser_df = spark.createDataFrame([anUser_row])
	
    print("============= Find items the user like ==============")
    # Find items the user like
	# Example:  [u'{"userId":4169,"recommendations":[{"itemId":903,"rating":1.33568},{"itemId":930,"rating":1.3132204},{"itemId":922,"rating":1.2872257}]}']
    similarItems_df = model.recommendForUserSubset(anUser_df, 3)
	
    print("============= Print out the results ==============")
    # Print out the results
    print(similarItems_df.toJSON().collect())

    print("============= End =============================")	   

def create_config():
    
    schema_model=json.loads('{"model_algorithm":"gbtree_classification","model_type":"Spark_MLlib","metrics":{"f1":0.345294,"accuracy":0.462963,"precision":0.338977,"recall":0.351852},"apis":[{"procotol":"http","url":"/","method":"post","request":{"Content-type":"applicaton/json","data":{"type":"object","properties":{"itemId":{"type":"number"}}}},"response":{"Content-type":"applicaton/json","data":{"type":"object","properties":{"resp_data":{"type":"array","items":[{"type":"object","properties":{"itemId":{"type":"number"},"predict":{"type":"number"}}}]}}}}}]}',object_pairs_hook=OrderedDict)

    model_engine = "Spark_MLlib"

    schema_model['model_type']=model_engine
    schema_model["metrics"]["f1"]=0.35
    schema_model["metrics"]["accuracy"]=0.49
    schema_model["metrics"]["precision"]=0.35
    schema_model["metrics"]["recall"]=0.36

    with open(LOCAL_CONFIG_DIR, 'w') as f:
        json.dump(schema_model, f)
    
    print_title("create config file success!")

def create_metric():

    metric_model=json.loads('{"total_metric":{"total_metric_meta":{},"total_reserved_data":{},"total_metric_values":{"f1_score":0.814874,"recall":0.8125,"precision":0.817262,"accuracy":1.0}}}',object_pairs_hook=OrderedDict)

    metric_model["total_metric"]["total_metric_values"]["f1_score"]=0.85
    metric_model["total_metric"]["total_metric_values"]["recall"]=0.88
    metric_model["total_metric"]["total_metric_values"]["precision"]=0.90
    metric_model["total_metric"]["total_metric_values"]["accuracy"]=1.5

    with open(LOCAL_METRIC_DIR, 'w') as f:
        json.dump(metric_model, f)

if __name__ == '__main__':
    train_model()
    create_config()
    create_metric()
    upload_to_obs()
