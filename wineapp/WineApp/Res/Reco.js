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

import { FlatList, View, StyleSheet, Button } from 'react-native';
import { Alert, Platform, TouchableOpacity } from 'react-native';
import ActionButton from 'react-native-action-button';
import { Icon, ListItem, List } from 'react-native-elements'
import AsyncStorage from '@react-native-community/async-storage';

const extractKey = ({ id }) => id

export default class Reco extends React.Component {
	
  static navigationOptions = {
    title: '智能推荐',
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
      idList: [],
      items: [],
      itemDetail: '',
      dataList: [],
    };

    this.updateState = this.updateState.bind(this);
    this.updateStateList = this.updateStateList.bind(this);
  }

  componentDidMount() {
	AsyncStorage.getItem("username").then((currentUser) => {
	    ParseUtil.getRecommendations(currentUser, this.updateState);
	})
    ParseUtil.getWinesDataList(this.updateStateList);
  }

  updateStateId(hotelResults) {
    this.setState({ idList: hotelResults })
  }

  updateState(hotelResults) {
    this.setState({ items: hotelResults })
  }
  updateStateList(hotelResults) {
    this.setState({ dataList: hotelResults })
  }

  FlatListItemSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: "100%",
          backgroundColor: "#607D8B",
        }}
      />
    );
  }

  renderSeparator = () => (
    <View
      style={{
        backgroundColor: 'blue',
        height: 1,
      }}
    />
  );

  renderItem = ({ item }) => {
    this.state.dataList.map((i, key) => {
      if (i.wineid == item.wineid) {
        item.name = i.name;
        item.image = i.image;
      }else if(i.wineid == item.basedOn){
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
        <Button
          title="继续购物"
          type="outline"
          onPress={() => this.props.navigation.navigate('Wines')}
        />

        <FlatList
          keyExtractor={(item, index) => index.toString()}
          data={this.state.items}
          renderItem={this.renderItem}
          onPress={() => this.props.navigation.navigate('Details')}
          ItemSeparatorComponent={this.renderSeparator}
        />

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
    );
  }

  actionOnRow(item) {
    console.log('Selected Item :', item);
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    flex: 1,
    backgroundColor: '#f3f3f3',
  },
  row: {
    padding: 15,
    marginBottom: 5,
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  },
})