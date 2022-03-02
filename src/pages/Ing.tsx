import React, {useEffect, useState} from 'react';
import {Dimensions, Text, SafeAreaView} from 'react-native';
import styled from 'styled-components/native';
import NaverMapView, {Marker, Path} from 'react-native-nmap';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store/reducer';
import Geolocation from '@react-native-community/geolocation';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {LoggedInParamList} from '../../App';

const IngContainer = styled.SafeAreaView`
  width: ${Dimensions.get('window').width}px;
  height: ${Dimensions.get('window').height}px;
`;

const ErrorView = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

type IngScreenProps = NativeStackScreenProps<LoggedInParamList, 'Delivery'>;

function Ing({navigation}: IngScreenProps) {
  console.dir(navigation);
  const {deliveries} = useSelector((state: RootState) => state.order);
  const [myPosition, setMyPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    Geolocation.watchPosition(
      info => {
        setMyPosition({
          latitude: info.coords.latitude,
          longitude: info.coords.longitude,
        });
      },
      console.error,
      {
        enableHighAccuracy: true,
        timeout: 20000,
        distanceFilter: 50,
      },
    );
  }, []);

  if (!deliveries?.[0]) {
    return (
      <ErrorView>
        <Text>주문을 먼저 수락해주세요!</Text>
      </ErrorView>
    );
  }

  if (!myPosition || !myPosition.latitude) {
    return (
      <ErrorView>
        <Text>내 위치를 로딩 중입니다. 권한을 허용했는지 확인해주세요.</Text>
      </ErrorView>
    );
  }

  const {start, end} = deliveries?.[0];

  return (
    <SafeAreaView>
      <IngContainer>
        <NaverMapView
          style={{width: '100%', height: '100%'}}
          zoomControl={true}
          center={{
            zoom: 10,
            tilt: 50,
            latitude: (start.latitude + end.latitude) / 2,
            longitude: (start.longitude + end.longitude) / 2,
          }}>
          {myPosition?.latitude && (
            <Marker
              coordinate={{
                latitude: myPosition.latitude,
                longitude: myPosition.longitude,
              }}
              width={15}
              height={15}
              anchor={{x: 0.5, y: 0.5}}
              caption={{text: '나'}}
              image={require('../assets/red-dot.png')}
            />
          )}
          {myPosition?.latitude && (
            <Path
              coordinates={[
                {
                  latitude: myPosition.latitude,
                  longitude: myPosition.longitude,
                },
                {latitude: start.latitude, longitude: start.longitude},
              ]}
              color="orange"
            />
          )}
          <Marker
            coordinate={{
              latitude: start.latitude,
              longitude: start.longitude,
            }}
            width={15}
            height={15}
            anchor={{x: 0.5, y: 0.5}}
            caption={{text: '출발'}}
            image={require('../assets/blue-dot.png')}
          />
          <Path
            coordinates={[
              {
                latitude: start.latitude,
                longitude: start.longitude,
              },
              {latitude: end.latitude, longitude: end.longitude},
            ]}
            color="orange"
          />
          <Marker
            coordinate={{latitude: end.latitude, longitude: end.longitude}}
            width={15}
            height={15}
            anchor={{x: 0.5, y: 0.5}}
            caption={{text: '도착'}}
            image={require('../assets/green-dot.png')}
            onClick={() => {
              console.log(navigation);
              navigation.push('Complete', {orderId: deliveries[0].orderId});
            }}
          />
        </NaverMapView>
      </IngContainer>
    </SafeAreaView>
  );
}

export default Ing;
