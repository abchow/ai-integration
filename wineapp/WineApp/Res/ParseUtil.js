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
import 'react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage'; 
import { Parse } from 'parse/react-native';

export default class ParseUtil {
  //TODO update the below host details(hostIP,port) with valid values before running the app
  static hostIP = '';
  //Configure port only when required.If hostIP contains the complete mbaas instance details, no need to configure port
  static port = '1337';

  static imageLibrary = null;
  static timerHandle = null;

  //get everything of the wine
  static getWinesDataList(callback) {
    init();
    var wines = Parse.Object.extend("Wines");
    var query = new Parse.Query(wines);

    return query.find().then((results) => {
      var wineResults = [];
      // Parse the returned Parse.Object values
      for (let i = 0; i < results.length; i++) {
        var object = results[i];
        var wineDetails = {};
        wineDetails.wineid = object.get('wineid');
        wineDetails.name = object.get('name');
        wineDetails.year = object.get('year');
        wineDetails.price = object.get('price');
        wineDetails.image = object.get('photo').url();
        wineDetails.origin = object.get('origin');
        wineDetails.description = object.get('description');

        wineResults.push(wineDetails);
      }
      callback(wineResults);
    });
  }

  static getWinesSummary(callback) {
    init();
    var wines = Parse.Object.extend("Wines");
    var query = new Parse.Query(wines);

    return query.find().then((results) => {
      var wineResults = [];
      // Parse the returned Parse.Object values
      for (let i = 0; i < results.length; i++) {
        var object = results[i];
        var wineDetails = {};
        wineDetails.id = object.get('wineid');
        wineDetails.name = object.get('name');
        wineDetails.year = object.get('year');
        wineDetails.price = object.get('price');
        wineResults.push(wineDetails);
      }
      callback(wineResults);
    });
  }

  static getWineLoad(callback) {
    init();
    var wines = Parse.Object.extend("Wines");
    var query = new Parse.Query(wines);

    return query.find().then((results) => {
      var wineResults = [];
      // Parse the returned Parse.Object values
      for (let i = 0; i < results.length; i++) {
        var object = results[i];
        var wineDetails = {};
        wineDetails.wineid = object.get('wineid');
        wineDetails.name = object.get('name');
        wineDetails.price = object.get('price');
        wineDetails.image = object.get('photo').url();
        wineResults.push(wineDetails);
      }
      callback(wineResults);
    });
  }

  static getWineDetails(searchid, callback) {
    init();
    var wines = Parse.Object.extend("Wines");
    var query = new Parse.Query(wines);
    query.equalTo("wineid", searchid);

    return query.find().then((results) => {
      var wineResults = [];
      // Parse the returned Parse.Object values
      for (let i = 0; i < results.length; i++) {
        var object = results[i];
        var wineDetails = {};

        wineDetails.wineid = object.get('wineid');
        wineDetails.origin = object.get('origin');
        wineDetails.image = object.get('photo').url();
        wineDetails.description = object.get('description');
        wineResults.push(wineDetails);
      }
      callback(wineResults);
    });
  }

  //return the wineid List of all the wines in the Recommendation page
  static getRecommendations(currentUser, callback) {
    init();
    var wines = Parse.Object.extend("Recommendations");
    var query = new Parse.Query(wines);
    return query.find().then((results) => {
      var wineResults = [];
      // Parse the returned Parse.Object values
      for (let i = 0; i < results.length; i++) {
        var objectK = results[i];
        var wineDetails = {};
        wineDetails.wineid = objectK.get('itemId');
        wineDetails.userid = objectK.get('userId');
        wineDetails.basedOn = objectK.get('basedOn');        
        if (currentUser == wineDetails.userid) {
        	wineResults.push(wineDetails);
        }
      }
      callback(wineResults);
    });
  }

  static getRecommendationsShort(currentUser, callback) {
    init();
    var wines = Parse.Object.extend("Recommendations");
    var query = new Parse.Query(wines);
    return query.find().then((results) => {
      var wineResults = [];
      // Parse the returned Parse.Object values
      var randomFirst = Math.floor(Math.random() * results.length);
      var randomSec = Math.floor(Math.random() * results.length);
      for (let i = 0; i < results.length; i++) {
        if(i == randomFirst || i == randomSec){
          var objectK = results[i];
          var wineDetails = {};
          wineDetails.wineid = objectK.get('itemId');
          wineDetails.userid = objectK.get('userId');
          wineDetails.basedOn = objectK.get('basedOn');
          if (currentUser == wineDetails.userid) {
        	  wineResults.push(wineDetails);
          }
        }
      }
      callback(wineResults);
    });
  }

  static insertToCarts(cartInsertionId, currentUser) {
    init();
    var CartsTemp = Parse.Object.extend("Carts");
    var queryTemp = new Parse.Query(CartsTemp);
    queryTemp.equalTo("wineid", cartInsertionId);
    queryTemp.find().then((resultsTemp) => {
      if (resultsTemp.length == 0) {
        var wines = Parse.Object.extend("Wines");
        var query = new Parse.Query(wines);
        query.equalTo("wineid", cartInsertionId);
        return query.find().then((results) => {
          // Parse the returned Parse.Object values
          for (let i = 0; i < results.length; i++) {
            var object = results[i];
            var Carts = Parse.Object.extend("Carts");
            var cart = new Carts;
            key = cartInsertionId;
            cart.set("wineid", cartInsertionId);
            cart.set("userid", currentUser);
            cart.set("quantity", 1);
            const tempName = object.get('name');
            cart.set("winename", tempName);
            const tempPrice = object.get('price');
            cart.set("wineprice", tempPrice);
            cart.save();
          }
        });
      } else {//already there, add one more quantity
        var object = resultsTemp[0];
        const currentQuantity = object.get("quantity");
        object.set("quantity", currentQuantity + 1);
        object.save();
        return object.save();
      }
    });
  }

  static setQuantity(wineId, updateNumber) {
    init();

    var CartsTemp = Parse.Object.extend("Carts");
    var queryTemp = new Parse.Query(CartsTemp);
    queryTemp.equalTo("wineid", wineId);
    return queryTemp.find().then((results) => {
      var object = results[0];
      object.set("quantity", updateNumber);
      return object.save();
    });
  }

  static async getCarts(userID, callback) {
	  
    init();
    var wines = Parse.Object.extend("Carts");
    var query = new Parse.Query(wines);
    query.equalTo("userid", userID);
    return query.find().then((results) => {
      var wineResults = [];
      for (let i = 0; i < results.length; i++) {
        var object = results[i];
        var wineDetails = {};
        wineDetails.wineid = object.get('wineid');
        wineDetails.userid = object.get('userid');
        wineDetails.name = object.get('winename');
        wineDetails.price = object.get('wineprice');
        wineDetails.quantity = object.get('quantity');
        wineResults.push(wineDetails);
      }
      callback(wineResults);
    });
  }

  static removeFromCarts = async (cartDeletionId) => {
    init();

    var CartsTemp = Parse.Object.extend("Carts");
    var queryTemp = new Parse.Query(CartsTemp);
    queryTemp.equalTo("wineid", cartDeletionId);
    return queryTemp.find().then((results) => {
      if (results.length == 0) {
        //do nothing just return
      } else {
        var myObject = results[0];
        myObject.destroy().then((myObject) => { }, (error) => { });
      }
    });
  }

  static removeFromReco = async (recoDeletionId) => {
    init();

    var recoTemp = Parse.Object.extend("Recommendations");
    var queryTemp = new Parse.Query(recoTemp);
    queryTemp.equalTo("basedOn", recoDeletionId);

    return queryTemp.find().then((results) => {
      for (let i = 0; i < results.length; i++) {
        var myObject = results[i];
        myObject.destroy().then((myObject) => { }, (error) => { });
      } 
    });
  }

  static cleanTheCart = async (searchUserId) => {
    init();

    var CartsTemp = Parse.Object.extend("Carts");
    var queryTemp = new Parse.Query(CartsTemp);
    queryTemp.equalTo("userid", searchUserId);
    return queryTemp.find().then((results) => {
      for (let i = 0; i < results.length; i++) {
        var myObject = results[i];
        myObject.destroy().then((myObject) => { }, (error) => { });
      }    
    });
  }
  
  static addQuantity = async (cartId) => {
    init();

    var CartsTemp = Parse.Object.extend("Carts");
    var queryTemp = new Parse.Query(CartsTemp);
    queryTemp.equalTo("wineid", cartId);
    return queryTemp.find().then((results) => {
      var object = results[0];
      object.set("quantity", object.get("quantity") + 1);
      return object.save();
    });
  }

  static minusQuantity = async (cartId) => {
    init();

    var CartsTemp = Parse.Object.extend("Carts");
    var queryTemp = new Parse.Query(CartsTemp);
    queryTemp.equalTo("wineid", cartId);
    return queryTemp.find().then((results) => {
      var object = results[0];
      const currentQuantity = object.get("quantity");
      if (currentQuantity == 1) {
        return this.removeFromCarts(cartId);
      } else {
        object.set("quantity", object.get("quantity") - 1);
        return object.save();
      }
    });
  }

  static login = async (username, pass, callback) => {
    init();

    try {
      const user = await Parse.User.logIn(username, pass);
      await AsyncStorage.setItem("username", username);      
      callback("success");
      // Hooray! Let them use the app now.
    } catch (error) {
      // Show the error message somewhere and let the user try again.
      callback(error.message);
    }
  }

  static signup(username, pass, email, callback) {
    init();
    Parse.User.logOut();
    var user = new Parse.User();
    user.set("username", username);
    user.set("password", pass);
    user.set("email", email);

    try {
      user.signUp();
      callback("success");
      // Hooray! Let them use the app now.
    } catch (error) {
      // Show the error message somewhere and let the user try again.
      callback(error.message);
    }
  }

  static logout() {
    init();
    Parse.User.logOut().then(() => {
      console.log("logout success ;;;;;;;;;");
    });
  }
}

const _storeData = async () => {
  try {
    await AsyncStorage.setItem('imageLibrary', ParseUtil.imageLibrary);
  } catch (error) {
    // Error saving data
  }
};

const _retrieveData = async (filebase64, callback, loadingcall) => {
  try {
    const value = await AsyncStorage.getItem('imageLibrary');
    if (value !== null) {
      // We have data!!
      console.log('imageLibrary' + value);
      ParseUtil.imageLibrary = value;
      if (filebase64 != undefined) {
        ParseUtil.retrieveImage(filebase64, callback, loadingcall);
      }
    }
  } catch (error) {
    // Error retrieving data
  }
};

const init = () => {
  //_retrieveData();
  Parse.setAsyncStorage(AsyncStorage);
  Parse.initialize("myAppId");
  if (ParseUtil.port == undefined || ParseUtil.port == "") {
    console.log('http://' + ParseUtil.hostIP + '/mbaas');
    Parse.serverURL = 'http://' + ParseUtil.hostIP + '/mbaas';
  }
  else {
    console.log('http://' + ParseUtil.hostIP + ':' + ParseUtil.port + '/mbaas');
    Parse.serverURL = 'http://' + ParseUtil.hostIP + ':' + ParseUtil.port + '/mbaas';
  }
}




