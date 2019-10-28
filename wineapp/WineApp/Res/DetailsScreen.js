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
import ParseUtil from './ParseUtil.js';

import { ScrollView, View, StyleSheet, Text } from 'react-native';
import { Alert, Platform } from 'react-native';
import Page from './Page.js';

import ActionButton from 'react-native-action-button';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-community/async-storage';

const extractKey = ({ id }) => id

export default class Wines extends React.Component {
	
  static navigationOptions = {
    title: '商品详情',
    headerStyle: {
      backgroundColor: '#5BC2E7',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  }

  constructor(props) {
    super(props);    
    this.state = {
      items: [],
      cart: [],
      itemDetail: this.props.navigation.state.params.itemDetail, //get wineid from the previous page
      cartInsertion: '', //pass on the info to insert new item into the cart
      currentUser: ''
    };
    this.updateState = this.updateState.bind(this);
  }

  componentDidMount() {
	AsyncStorage.getItem("username").then((currentUser) => {
		this.state.currentUser = currentUser;
		ParseUtil.getWineDetails(this.state.itemDetail, this.updateState);
	})
  }
  
  updateState(hotelResults) {
    this.setState({ items: hotelResults })
  }

  FlatListItemSeparator = () => <View style={styles.line} />;

  renderItems() {
    return this.state.items.map((i, key) => {
      return (
        <Page key={key}
          wineid={i.wineid}
          origin={i.origin}
          description={i.description}
          source={i.image}
          count={key}
        />
      );
    });
  }

  render() {	
	// Parameter may not be passed.  Check if the parameter changes and update
	const itemId = this.props.navigation.getParam('itemDetail', 'NO-ID');
	if (itemId !== this.state.itemDetail) {
		ParseUtil.getWineDetails(itemId, this.updateState);
		this.state.itemDetail = itemId;
	}
	  
    return (
      <View>
        <ScrollView>
          <Button
            title="加入购物车"
            type="outline"
            onPress={() => {
              ParseUtil.insertToCarts(this.state.itemDetail, this.state.currentUser);
              Alert.alert(
                '已添加至购物车',
                '',
                [
                  { text: '好的', onPress: () => console.log('OK Pressed') },
                ],
                { cancelable: false },
              );
            }}
          />
          <Button
            title="结算"
            type="outline"
            onPress={() => this.props.navigation.navigate('CartCombine')}
          />
          <View style={styles.container}>
            {this.renderItems()}
          </View>
          <Text> </Text>
          <Text> </Text>

          <Button
            title="加入购物车"
            type="outline"
            onPress={() => ParseUtil.insertToCarts(this.state.itemDetail, this.state.currentUser)}
          />
          <Button
            title="结算"
            type="outline"
            onPress={() => this.props.navigation.navigate('CartCombine')}
          />
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>

        </ScrollView>
        <ActionButton buttonColor="rgba(231,76,60,1)">
          <ActionButton.Item buttonColor='#9b59b6'
            title="购物车"
            onPress={() => this.props.navigation.navigate('CartCombine')}>
            <Icon style={styles.actionButtonIcon} />
          </ActionButton.Item>

          <ActionButton.Item buttonColor='#3498db' title="好物推荐"
            onPress={() => this.props.navigation.navigate('Reco')}>
            <Icon style={styles.actionButtonIcon} />
          </ActionButton.Item>

          <ActionButton.Item buttonColor='#1abc9c' title="切换用户"
            onPress={() => {
              Alert.alert(
                'Logout',
                '确定登出?',
                [
                  { text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                  {
                    text: '确认', onPress: () => {
                      ParseUtil.logout();
                      this.props.navigation.navigate('Home')
                    }
                  },
                ],
                { cancelable: false }
              )
            }}>
            <Icon style={styles.actionButtonIcon} />
          </ActionButton.Item>
        </ActionButton>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    flex: 1,
  },
  row: {
    padding: 15,
    marginBottom: 5,
    backgroundColor: 'skyblue',
  },
})