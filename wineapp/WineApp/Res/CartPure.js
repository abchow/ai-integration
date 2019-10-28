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
  FlatList, View, StyleSheet,
  Text, Alert, TouchableOpacity
} from 'react-native';
import ActionButton from 'react-native-action-button';
import AsyncStorage from '@react-native-community/async-storage';
import NumericInput from 'react-native-numeric-input'

import { Button, ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';

export default class CartPure extends React.Component {
	
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
    	ParseUtil.getRecommendations(currentUser, this.updateStateReco);
	})
    ParseUtil.getWinesDataList(this.updateStateList);
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

  renderItems() {
    return this.state.items.map((i, key) => {
      return (
        <View keyExtractor={(i, key) => key.toString()}>
          <Text style={styles.title}>{i.name}</Text>
          <View style={styles.Bcontainer}>
            <Text style={styles.price}>   </Text>
            <NumericInput
              value={i.quantity}
              onChange={(v3) => { this.setState({ v3 }), this.updateQuantity(i.wineid, v3) }}
              rounded minValue={0}
              onLimitReached={(isMax, msg) => console.log(isMax, msg)} />
            <Text> x ${i.price}.00    </Text>
            <Icon name="trash" size={30} color="#808080" onPress={() => this.removeAndReload(i.wineid)} />
            <View style={styles.seprator} />
          </View>

          <View style={styles.Bcontainer}>
            <View style={styles.buttonContainer}>
              <Button
                title="-" type="clear"
                onPress={() => this.minusAndReload(i.wineid)}
              />
            </View>
            <View style={styles.buttonContainer}>
              <Button
                title="+" type="clear"
                onPress={() => this.addAndReload(i.wineid)}
              />
            </View>
            <View style={styles.buttonContainer}>
              <Button
                title="X"
                type="clear"       
                onPress={() => this.removeAndReload(i.wineid)}
              />
            </View>
          </View>
        </View>
      );
    });
  }

  renderItemSec() {
    return this.state.reco.map((i, key) => {
      return (
        <View  >
          <ListItem
            key={key}
            keyExtractor={(i, key) => key.toString()}
            title={i.name}
            subtitle={i.basedon}
            leftAvatar={{ source: { uri: i.image } }}
          />
          <Text> </Text>
        </View>
      );
    });
  }

  FlatListItemSeparator = () => {
    return (
      //Item Separator
      <View style={{ height: 0.5, width: '100%', backgroundColor: '#C8C8C8' }} />
    );
  };

  renderSeparatorCart = () => (
    <View
      style={{
        backgroundColor: 'blue',
        height: 1,
      }}
    />
  );

  renderSeparatorReco = () => (
    <View
      style={{
        backgroundColor: '#C8C8C8',
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
        <TouchableOpacity onPress={() => this.props.navigation.navigate('Details', { itemDetail: item.wineid })}>
          <ListItem
            title={item.name}
            subtitle={item.basedOn}
            leftAvatar={{ source: { uri: item.image } }}
          />
        </TouchableOpacity>
        <View style={styles.BcontainerL}>
          <Text>                           </Text>
          <View style={styles.buttonContainerL}>
            <Button
              title="-" type="outline"
              onPress={() => this.minusAndReload(item.wineid)}
            />
          </View>
          <Text style={styles.quantity}>{item.quantity} x ${item.price}.00    </Text>
          <View style={styles.buttonContainerL}>
            <Button
              title="+" type="outline"
              onPress={() => this.addAndReload(item.wineid)}
            />
          </View>
          <Text>       </Text>
          <Icon name="trash" size={30} color="#808080" onPress={() => this.removeAndReload(item.wineid)} />
          <View style={styles.seprator} />
        </View>
      </View>
    )
  }

  renderItemReco = ({ item }) => {
    this.state.dataList.map((i, key) => {
      if (i.wineid == item.wineid) {
        item.name = i.name;
        item.image = i.image;
      }
    })
    return (
      <TouchableOpacity onPress={() => this.props.navigation.navigate('Details', { itemDetail: item.id })}>
        <ListItem
          title={item.name}
          subtitle={item.basedOn}
          leftAvatar={{ source: { uri: item.image } }}
        />
      </TouchableOpacity>
    )
  }
  render() {
    return (
      <View style={{ flex: 1 }}>

        <Button
          title="继续购物"
          type="outline"
          onPress={() => this.props.navigation.navigate('Wines')}
        />

        <FlatList
          keyExtractor={(item, index) => index.toString()}
          data={this.state.items}
          renderItem={this.renderItemCart}
          onPress={() => this.props.navigation.navigate('Details')}
          ItemSeparatorComponent={this.renderSeparatorCart}
        />

        <Button
          title="智能推荐"
          type="outline"
          onPress={() => this.props.navigation.navigate('Reco')}
        />

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
  },

  buttonContainer: {
    backgroundColor: '#5BC2E7',
    padding: 5,
    fontSize: 6,
  },
  BcontainerL: {
    flexDirection: 'row',
  },

  buttonContainerL: {
    padding: 5,
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