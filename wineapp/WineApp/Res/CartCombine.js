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
import ParseUtil from './ParseUtil.js'

import {
  FlatList, View, StyleSheet, Text,
  TouchableOpacity, Alert
} from 'react-native';
import ActionButton from 'react-native-action-button';
import AsyncStorage from '@react-native-community/async-storage';
import {NavigationEvents} from 'react-navigation';

import { Button, ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/SimpleLineIcons';

export default class CartCombine extends React.Component {
	
  static navigationOptions = {
    title: '我的购物车',
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
      reco: [],
      value: 0,
      amount: 0,
      v3: 0,
      itemDetail: '',
      dataList: [],
    };
    this.updateState = this.updateState.bind(this);
    this.updateStateReco = this.updateStateReco.bind(this);
    this.updateStateList = this.updateStateList.bind(this);
    this.amount = 0;
  }

  changeAmount(text) {
    this.amount = text
  }

  componentDidMount() {	    
	AsyncStorage.getItem("username").then((currentUser) => {
		ParseUtil.getCarts(currentUser, this.updateState);
		ParseUtil.getRecommendationsShort(currentUser, this.updateStateReco);
		ParseUtil.getWinesDataList(this.updateStateList);
	})
  }

  updateState(hotelResults) {
    this.setState({
      items: hotelResults
    })
  }

  updateStateReco(hotelResults) {
    this.setState({
      reco: hotelResults
    })
  }
  
  updateStateList(hotelResults) {
    this.setState({ dataList: hotelResults })
  }

  removeAndReload = async (removeId) => {
    await ParseUtil.removeFromCarts(removeId);
    var currentUser = await AsyncStorage.getItem("username");
    ParseUtil.getCarts(currentUser, this.updateState);
  }
  
  reloadCart = async () => {
	var currentUser = await AsyncStorage.getItem("username");
	ParseUtil.getCarts(currentUser, this.updateState);
  }

  addAndReload = async (cartId) => {
    await ParseUtil.addQuantity(cartId);
    var currentUser = await AsyncStorage.getItem("username");
    ParseUtil.getCarts(currentUser, this.updateState);
  }

  minusAndReload = async (cartId) => {
    await ParseUtil.minusQuantity(cartId);
    var currentUser = await AsyncStorage.getItem("username");
    ParseUtil.getCarts(currentUser, this.updateState);
  }

  addRecoToCartAndReload = async (insertWineId) => {
	var currentUser = await AsyncStorage.getItem("username");
    await ParseUtil.insertToCarts(insertWineId, currentUser);
    ParseUtil.getRecommendations(currentUser, this.updateStateReco);
    ParseUtil.getCarts(currentUser, this.updateState);
  }

  updateQuantity = async (wineId, updateQuantity) => {
    await ParseUtil.setQuantity(wineId, updateQuantity);
    var currentUser = await AsyncStorage.getItem("username");
    ParseUtil.getRecommendations(currentUser, this.updateStateReco);
    ParseUtil.getCarts(currentUser, this.updateState);
  }

  reloadRecoRandom = async () => {
    var currentUser = await AsyncStorage.getItem("username");
    await ParseUtil.getRecommendationsShort(currentUser, this.updateStateReco);
    ParseUtil.getCarts(currentUser, this.updateState);
  }

  cleanTheCart = async () => {
	var currentUser = await AsyncStorage.getItem("username");
    await ParseUtil.cleanTheCart(currentUser);
    ParseUtil.getCarts(currentUser, this.updateState);
  }

  deleteCartItem = async (deleteId) => {
    await ParseUtil.removeFromCarts(deleteId);
    await ParseUtil.removeFromReco(deleteId);
    var currentUser = await AsyncStorage.getItem("username");
    ParseUtil.getCarts(currentUser, this.updateState);
    ParseUtil.getRecommendationsShort(currentUser, this.updateStateReco);
  }

  FlatListItemSeparator = () => {
    return (
      //Item Separator
      <View style={{ height: 0.5, width: '100%', backgroundColor: '#5BC2E7' }} />
    );
  };

  renderSeparatorCart = () => (
    <View
      style={{
        backgroundColor: '#5BC2E7',
        height: 1,
      }}
    />
  );

  renderSeparatorReco = () => (
    <View
      style={{
        backgroundColor: '#5BC2E7',
        height: 1,
      }}
    />
  );

  renderItemCart = ({ item }) => {	  
    this.state.dataList.map((i, key) => {
      if (i.wineid == item.wineid) {
        item.name = i.name;
        item.image = i.image;
      }
    })
    
    return (
      <View>
        <TouchableOpacity onPress={() => 
        	{ 
        		this.props.navigation.navigate('Details', { itemDetail: item.wineid });
        	}
          }>
          <ListItem
            title={item.name}
            subtitle={item.basedOn}
            leftAvatar={{ source: { uri: item.image } }}
          />
        </TouchableOpacity>

        <View style={[{ flexDirection: 'row-reverse' }]}>
          <View
            style={{
              width: 30,
              height: 30,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Icon name="trash" size={20} color="#808080" onPress={() => this.deleteCartItem(item.wineid)} />
          </View>

          <View
            style={{
              width: 30,
              height: 30,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Icon name="plus" size={20} color="#808080" onPress={() => this.addAndReload(item.wineid)} />
          </View>

          <View style={{
            width: 150,
            height: 30,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{
              color: '#808080',
              fontSize: 20
            }}>
              {item.quantity} x ${item.price}.00
              </Text>
          </View>

          <View
            style={{
              padding: 3,
              width: 30,
              height: 30,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Icon name="minus" size={20} color="#808080" onPress={() => this.minusAndReload(item.wineid)} />
          </View>
        </View>
      </View>
    )
  }

  renderItemReco = ({ item }) => {
    this.state.dataList.map((i, key) => {
      if (i.wineid == item.wineid) {
        item.name = i.name;
        item.image = i.image;
      } else if (i.wineid == item.basedOn) {
        item.basedOnName = "We recommended this based on your choice of " + i.name;
      }
    })
    return (
      <TouchableOpacity onPress={() => this.props.navigation.navigate('Details', { itemDetail: item.wineid })}>
        <ListItem
          title={item.name}
          subtitle={item.basedOnName}
          leftAvatar={{ source: { uri: item.image } }}
        />
      </TouchableOpacity>
    )
  }
    
  render() {
    return (    		
      <View style={{ flex: 1 }}>
        <NavigationEvents onDidFocus={() => this.reloadCart()} />
        <View style={[{ flexDirection: 'row' }]}>
        </View>

        <View style={{
          flexDirection: 'row',
          alignItems: 'stretch',
          justifyContent: 'center',
        }}>

        <View >
            <Button
              style={{
                width: 200,
                height: 42,
                borderWidth: 0.7,
                borderColor: '#2290f0',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="                  继续购物                  "
              type="outline"
              onPress={() => this.props.navigation.navigate('Wines')}
            />
        </View>
        <View>
            <Button
              style={{
                width: 200,
                height: 42,
                borderWidth: 0.7,
                borderColor: '#2290f0',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="                  结算下单                  "
              type="outline"
              onPress={() => this.cleanTheCart()}
            />
          </View>
        </View>

        <View style={{ flex: 3 }} >
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            data={this.state.items}
            renderItem={this.renderItemCart}
            onPress={() => this.props.navigation.navigate('Details')}
            ItemSeparatorComponent={this.renderSeparatorCart}
          />
        </View>

        <View style={[{ flexDirection: 'row-reverse' }]}>
          <View
            style={{
              width: 40,
              height: 42,
              borderWidth: 0.7,
              borderColor: '#2290f0',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Icon name={"close"} size={25} color="#2290f0" onPress={() => this.props.navigation.navigate('CartPure')} />
          </View>

          <View
            style={{
              width: 40,
              height: 42,
              borderWidth: 0.7,
              borderColor: '#2290f0',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Icon name={"reload"} size={25} color="#2290f0" onPress={() => this.reloadRecoRandom()} />
          </View>

          <Button
            title="                                   查看全部智能推荐                     "
            type="outline"
            onPress={() => this.props.navigation.navigate('Reco')}
          />
        </View>

        <View style={{ flex: 2 }} >
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            data={this.state.reco}
            renderItem={this.renderItemReco}
            onPress={() => this.props.navigation.navigate('Details')}
            ItemSeparatorComponent={this.renderSeparatorReco}
          />
        </View>
        <ActionButton buttonColor="rgba(231,76,60,1)">
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
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  SectionHeaderStyle: {
    backgroundColor: '#CDDC89',
    fontSize: 20,
    padding: 5,
    color: '#fff',
  },

  SectionListItemStyle: {
    fontSize: 15,
    padding: 15,
    color: '#000',
    backgroundColor: '#F5F5F5',
  },

  Bcontainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  BcontainerTop: {

    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
  },

  buttonContainer: {
    padding: 5,
    alignItems: 'stretch',
    color: '#fff',
    fontSize: 6,
  },
  BcontainerL: {
    flexDirection: 'row',
  },
  
  buttonContainerL: {
    padding: 3,
    color: '#fff',
    fontSize: 10,
  },
  seprator: {
    height: 10,
    width: 200,
    margin: 10,
  },
  quantity: {
    fontFamily: 'sans-serif-medium',
    fontSize: 25,
  },
  price: {
    fontFamily: 'sans-serif-medium',
    fontSize: 20,
    marginLeft: 250,
    marginBottom: 5,
  },
})