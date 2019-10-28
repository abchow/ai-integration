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
'use strict';

import React from 'react';
import { Platform, StyleSheet, View, Text, Alert } from 'react-native';
import { Image, Dimensions, TextInput } from 'react-native';
import { ScrollView, } from 'react-native';
import { createAppContainer, createStackNavigator } from 'react-navigation'; // Version can be specified in package.json

import { Button } from 'react-native-elements';

import CartCombine from './Res/CartCombine.js';
import CartPure from './Res/CartPure.js';
import SignUp from './Res/SignUp.js';
import DetailsScreen from './Res/DetailsScreen.js';
import Reco from './Res/Reco.js';
import DashBoard from './Res/DashBoard.js';
import Wines from './Res/Wines.js';
import ParseUtil from './Res/ParseUtil.js';

const { width } = Dimensions.get('window');

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: '',
      password: '',
    }
    this.loginState = this.loginState.bind(this);
  }

  onClickLogIn() {
    const { user, password } = this.state;
    ParseUtil.login(user, password, this.loginState);
  }

  loginState(result) {
    if (result == "success") {
      this.props.navigation.navigate('Dash');
    }
    else {
      Alert.alert("Error", "登入失败." + "用户/密码错误");
    }
  }

  render() {
    return (

      <View style={styles.container}>

        <Image
          resizeMode='contain'
          style={styles.logo}
          source={require('./Res/imgs/logo.png')}
        />
        <Text style={styles.text}>GOODWINE</Text>

        <View style={styles.flowRight}>
          <TextInput
            underlineColorAndroid={'transparent'}
            style={styles.searchInput}
            keyboardType="default"
            placeholder='userName'
            onChangeText={(user) => this.setState({ user })} />
        </View>

        <View style={styles.flowRight}>
          <TextInput
            underlineColorAndroid={'transparent'}
            style={styles.searchInput}
            secureTextEntry={true}
            placeholder='passWord'
            onChangeText={(password) => this.setState({ password })} />
        </View>
        <ScrollView>
          <Button
            title="登入"
            type="clear"
            onPress={() => this.onClickLogIn()}
          />
          <Button
            title="注册"
            type="clear"
            onPress={() => this.props.navigation.navigate('SignUp')}
          />
        </ScrollView>
        <View>
        </View>
      </View>
    );
  }
}

const RootStack = createStackNavigator(
  {
    Home: {
      screen: HomeScreen, // Home page
    },
    Wines: {
      screen: Wines, // Wine list page
    },
    Dash: {
      screen: DashBoard, // Dashboard
    },
    Details: {
      screen: DetailsScreen, // Wine detail page
    },
    Reco: {
      screen: Reco, // Recommendation page
    },
    CartCombine: {
      screen: CartCombine, // Cart page with Recommendations
    },
    CartPure: {
      screen: CartPure, // Cart page only
    },
    SignUp: {
      screen: SignUp,
    },
  },
  {
    initialRouteName: 'Home',
  }
);

const AppContainer = createAppContainer(RootStack);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40
  },

  flowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 20,
  },

  searchInput: {
    height: 35,
    padding: 4,
    marginRight: 50,
    marginLeft: 50,
    alignItems: 'center',
    flexGrow: 1,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#48BBEC',
    borderRadius: 8,
    color: '#48BBEC',
  },

  text: {
    fontSize: 40,
  },
  text1: {
    fontSize: 40,
  },

  logo: {
    width: width / 3,
    marginBottom: 6,
    maxHeight: 50
  }

});

export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}

