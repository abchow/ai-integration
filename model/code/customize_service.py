
import numpy as np
import json
import model_service.log as log
import traceback

from model_service.spark_model_service import SparkServingBaseService
from pyspark.sql import SparkSession, Row, DataFrame
from pyspark.ml.recommendation import ALS, ALSModel

logger = log.getLogger(__name__)

class RecommenderService(SparkServingBaseService):

  # Request data preprocess.  Extract item ID from request
  def _preprocess(self, data_str):      
    req_json = json.loads(data_str)
    reqdata_dict = req_json["data"]
    itemId_int = reqdata_dict["itemId"]
	
    return itemId_int
	  		
  # Load model and predict item similarity
  def _inference(self, itemId_int):
    try:
      # load model
      model_als = ALSModel.load(self.model_path)
    except Exception:
      logger.error(traceback.format_exc())
      raise Exception('Load ALSModel model failed.', traceback)
	  
    # Create test data
	# Example:  [u'{"itemId":26}']
    item_row = Row(itemId=itemId_int)
    item_df  = self.spark.createDataFrame([item_row])
	
	# Return user liked this item most
    # Example:  [u'{"itemId":26,"recommendations":[{"userId":4169,"rating":0.6387643}]}']# Use the model to make predictions
    userRatings_df = model_als.recommendForItemSubset(item_df, 1)
	
	# Define return varaible.  
	# similarItems is 0 if there is there is no user recommendation.  
	# i.e. item ID does not exist in the model
    similarItems = 0
	
	# If there is recommendation
    if userRatings_df.count() > 0:
	  # Create User DataFrame
	  # Example:  [u'{"userId":4169}']
      anUser_int = userRatings_df.first()['recommendations'][0]['userId']
      anUser_row = Row(userId=anUser_int)
      anUser_df = self.spark.createDataFrame([anUser_row])
	
      # Find the top 4 items the user like
	  # Example: 
	  # [u'{"userId":4169,"recommendations":[{"itemId":903,"rating":1.33568},{"itemId":930,"rating":1.3132204},{"itemId":922,"rating":1.2872257}]}']
      userInterest_df = model_als.recommendForUserSubset(anUser_df, 4)
      
      # Go over the list of user interests and filter out the request item
      # Example of filtered recommendation: 
      #   [{"itemId":903,"rating":1.33568},{"itemId":930,"rating":1.3132204},{"itemId":922,"rating":1.2872257}]
      recomFiltered_arr = []
      counter_int = 1
      for anItemRating_dict in userInterest_df.first()['recommendations']:
         if counter_int <= 3 and str(anItemRating_dict['itemId']) != str(itemId_int):       
           recomFiltered_arr.append(anItemRating_dict)
           counter_int = counter_int + 1

      similarItems = recomFiltered_arr

    return similarItems

  # Process prediction result.  Transform prediction data frame to dict.
  # predictResult is 0 or DataFrame
  # Example of predictResult:  
  #   [{"itemId":903,"rating":1.33568},{"itemId":930,"rating":1.3132204},{"itemId":922,"rating":1.2872257}]
  def _postprocess(self, predictResult):
    recommend_list = []
	
    for aPredict_list in predictResult:
      aRec_dict = {}
      aRec_dict["itemId"] = aPredict_list[0]
      aRec_dict["predict"] = aPredict_list[1]
      recommend_list.append(aRec_dict)
      
    return recommend_list
	
