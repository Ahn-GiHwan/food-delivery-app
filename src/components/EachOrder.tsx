import React, {useCallback, useState} from 'react';
import {Alert, ActivityIndicator, Dimensions} from 'react-native';
import styled from 'styled-components/native';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import axios, {AxiosError} from 'axios';
import orderSlice, {Order} from '../redux/slices/order';
import {useAppDispatch} from '../redux/store';
import getDistanceFromLatLonInKm from '../util';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store/reducer';
import {LoggedInParamList} from '../../App';
import useConfig from '../hooks/useConfig';
import NaverMapView, {Marker, Path} from 'react-native-nmap';

const Container = styled.View`
  margin: 5px;
  border-radius: 5px;
  padding: 10px;
  background-color: lightgray;
`;

const Info = styled.Pressable`
  flex-direction: row;
`;

const EachInfo = styled.Text`
  flex: 1;
`;

const DetailContainer = styled.View``;
const NaverMapContainer = styled.View``;
const NaverMap = styled.View`
  width: ${Dimensions.get('window').width - 30}px;
  height: 200px;
  margin-top: 10px;
`;

const ButtonWrapper = styled.View`
  flex-direction: row;
`;

const Button = styled.Pressable`
  flex: 1;
  align-items: center;
  padding-vertical: 10px;
`;

const AcceptButton = styled(Button)`
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  background-color: blue;
`;

const RejectButton = styled(Button)`
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  background-color: red;
`;

const ButtonText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: white;
`;

interface Props {
  item: Order;
}

function EachOrder({item}: Props) {
  const navigation = useNavigation<NavigationProp<LoggedInParamList>>();
  const dispatch = useAppDispatch();
  const {accessToken} = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(false);
  const [detail, showDetail] = useState(false);
  const URL = useConfig();

  const onAccept = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    try {
      setLoading(true);
      await axios({
        url: `${URL}/accept`,
        data: {orderId: item.orderId},
        method: 'POST',
        headers: {authorization: `Bearer ${accessToken}`},
      });
      setLoading(false);
      dispatch(orderSlice.actions.acceptOrder(item.orderId));
      navigation.navigate('Delivery');
    } catch (error) {
      const errorResponse = (error as AxiosError).response;
      if (errorResponse?.status === 400) {
        // 타인이 이미 수락한 경우
        Alert.alert('알림', errorResponse.data.message);
        dispatch(orderSlice.actions.rejectOrder(item.orderId));
      }
      setLoading(false);
    }
  }, [accessToken, URL, item.orderId, dispatch, navigation]);

  const onReject = useCallback(() => {
    dispatch(orderSlice.actions.rejectOrder(item.orderId));
  }, [dispatch, item]);

  const {start, end} = item;

  const toggleDetail = useCallback(() => {
    showDetail(prevState => !prevState);
  }, []);

  return (
    <Container>
      <Info onPress={toggleDetail}>
        <EachInfo>
          {item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원
        </EachInfo>
        <EachInfo>
          {getDistanceFromLatLonInKm(
            start.latitude,
            start.longitude,
            end.latitude,
            end.longitude,
          ).toFixed(1)}
          km
        </EachInfo>
      </Info>
      {detail && (
        <DetailContainer>
          <NaverMapContainer>
            <NaverMap>
              <NaverMapView
                style={{width: '100%', height: '100%'}}
                zoomControl={false}
                center={{
                  zoom: 10,
                  tilt: 50,
                  latitude: (start.latitude + end.latitude) / 2,
                  longitude: (start.longitude + end.longitude) / 2,
                }}>
                <Marker
                  coordinate={{
                    latitude: start.latitude,
                    longitude: start.longitude,
                  }}
                  pinColor="blue"
                />
                <Path
                  coordinates={[
                    {
                      latitude: start.latitude,
                      longitude: start.longitude,
                    },
                    {latitude: end.latitude, longitude: end.longitude},
                  ]}
                />
                <Marker
                  coordinate={{
                    latitude: end.latitude,
                    longitude: end.longitude,
                  }}
                />
              </NaverMapView>
            </NaverMap>
          </NaverMapContainer>
          <ButtonWrapper>
            <AcceptButton onPress={onAccept}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <ButtonText>수락</ButtonText>
              )}
            </AcceptButton>
            <RejectButton onPress={onReject}>
              <ButtonText>거절</ButtonText>
            </RejectButton>
          </ButtonWrapper>
        </DetailContainer>
      )}
    </Container>
  );
}

export default EachOrder;
