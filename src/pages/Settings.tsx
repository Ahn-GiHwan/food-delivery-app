import React, {useCallback, useEffect} from 'react';
import {Alert, FlatList, View} from 'react-native';
import axios, {AxiosError} from 'axios';
import {useAppDispatch} from '../redux/store';
import userSlice from '../redux/slices/user';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store/reducer';
import EncryptedStorage from 'react-native-encrypted-storage';
import styled from 'styled-components/native';
import useConfig from '../hooks/useConfig';
import orderSlice from '../redux/slices/order';
import EachComplete from '../components/EachComplete';

const Container = styled.SafeAreaView``;

const Money = styled.View`
  padding: 20px;
`;

const MoneyText = styled.Text`
  font-size: 16px;
`;

const Price = styled.Text`
  font-weight: bold;
`;

const ButtonZone = styled.View`
  align-items: center;
  padding-top: 20px;
`;

const LogoutButton = styled.Pressable`
  margin-bottom: 10px;
  border-radius: 5px;
  padding-horizontal: 20px;
  padding-vertical: 10px;
  background-color: blue;
`;

const LogoutButtonText = styled.Text`
  font-size: 16px;
  color: white;
`;

function Settings() {
  const {accessToken, money, name} = useSelector(
    (state: RootState) => state.user,
  );
  const {completes} = useSelector((state: RootState) => state.order);
  const dispatch = useAppDispatch();
  const URL = useConfig();
  const onLogout = useCallback(async () => {
    try {
      await axios({
        url: `${URL}/logout`,
        method: 'POST',
        headers: {authorization: `Bearer ${accessToken}`},
      });
      Alert.alert('알림', '로그아웃 되었습니다.');
      dispatch(
        userSlice.actions.setUser({
          name: '',
          email: '',
          accessToken: '',
        }),
      );
      await EncryptedStorage.removeItem('refreshToken');
    } catch (error) {
      const errorResponse = (error as AxiosError).response;
      Alert.alert('에러', errorResponse?.data.message);
    }
  }, [URL, accessToken, dispatch]);

  useEffect(() => {
    const getMoney = async () => {
      const response = await axios({
        url: `${URL}/showmethemoney`,
        method: 'GET',
        headers: {authorization: `Bearer ${accessToken}`},
      });
      dispatch(userSlice.actions.setMoney(response.data.data));
    };
    getMoney();
  }, [URL, accessToken, dispatch]);

  useEffect(() => {
    async function getCompletes() {
      const response = await axios({
        url: `${URL}/completes`,
        method: 'GET',
        headers: {authorization: `Bearer ${accessToken}`},
      });
      dispatch(orderSlice.actions.setCompelte(response.data.data));
    }
    getCompletes();
  }, [URL, accessToken, dispatch]);

  const renderItem = useCallback(({item}) => {
    return <EachComplete item={item} />;
  }, []);

  return (
    <Container>
      <Money>
        <MoneyText>
          {name}님의 수익금{' '}
          <Price>
            {money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          </Price>
          원
        </MoneyText>
      </Money>
      <View>
        <FlatList
          data={completes}
          keyExtractor={com => com.orderId}
          renderItem={renderItem}
          numColumns={3}
        />
      </View>
      <ButtonZone>
        <LogoutButton onPress={onLogout}>
          <LogoutButtonText>로그아웃</LogoutButtonText>
        </LogoutButton>
      </ButtonZone>
    </Container>
  );
}

export default Settings;
