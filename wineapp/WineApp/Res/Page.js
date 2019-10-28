/**
 * Copyright 2019 Huawei Technologies Co., Ltd. All rights reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';
import { StyleSheet, Text, Image, Dimensions } from 'react-native';
import { ScrollView } from 'react-native';

const { width } = Dimensions.get('window');

export default Page = ({
  wineid,
  origin,
  source,
  description,
  count,
}) => (
    <ScrollView>
	    <Text style={styles.origin}>ORIGINALLY FROM: </Text>
	    <Text style={styles.origin}>{origin}</Text>
	    <Image
	      resizeMode='contain'
	      source={{uri:source}}
	      style={styles.image}
	    />
	    <Text style={styles.origin}>INTRODUCTION:</Text>
	    <Text style={styles.description}>{description}</Text>
    </ScrollView> 
)

const styles = StyleSheet.create({
  card: {
    backgroundColor:'#fff',
    marginBottom:10,
    marginLeft: '2%',
    width:'96%',
    shadowColor:'#f00',
    shadowOpacity:0.2,
    shadowRadius:1,
    shadowOffset:{
      width:3,
      height:3
    }
  },

  title: {
    fontFamily: 'sans-serif-medium',
    fontSize: 15,
    marginTop: 6,
    marginLeft: 10,
    marginBottom: -4,
  },
  description: {
    fontFamily: 'sans-serif-condensed',
    fontSize: 16,
    marginLeft: 10,
  },
  image: {
    height: 250,
    width,
  },
  year: {
    fontFamily: 'sans-serif-medium',
    fontSize: 28,
    marginLeft: 10,
    marginBottom: 10,
    alignItems: 'center'
  },
  price: {
    fontFamily: 'sans-serif-medium',
    fontSize: 28,
    marginLeft: 10,
    marginBottom: 10,
  },
  origin: {
    fontFamily: 'sans-serif-medium',
    fontSize: 28,
    marginLeft: 10,
    marginBottom: 10,
  }
})