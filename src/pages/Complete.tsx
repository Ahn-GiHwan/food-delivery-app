import React, {useCallback, useState} from 'react';
import {SafeAreaView, Alert, Dimensions, Text} from 'react-native';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import styled from 'styled-components/native';
import {LoggedInParamList} from '../../App';
import ImagePicker from 'react-native-image-crop-picker';
import ImageResizer from 'react-native-image-resizer';
import axios, {AxiosError} from 'axios';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store/reducer';
import orderSlice from '../redux/slices/order';
import {useAppDispatch} from '../redux/store';
import useConfig from '../hooks/useConfig';

const OrderId = styled.View`
  padding: 20px;
`;
const Preview = styled.View`
  width: ${Dimensions.get('window').width - 20}px;
  height: ${Dimensions.get('window').height / 3}px;
  margin-horizontal: 10px;
  margin-bottom: 10px;
  background-color: #d2d2d2;
`;

const PreviewImage = styled.Image.attrs({resizeMode: 'contain'})`
  height: ${Dimensions.get('window').height / 3}px;
`;

const ButtonWrapper = styled.View`
  flex-direction: row;
  justify-content: center;
`;

const Button = styled.Pressable`
  align-items: center;
  width: 120px;
  margin: 5px;
  border-radius: 5px;
  padding-horizontal: 20px;
  padding-vertical: 10px;
  background-color: ${({disabled}) => (disabled ? 'gray' : 'yellow')};
`;

const ButtonText = styled.Text`
  color: black;
`;

function Complete() {
  const dispatch = useAppDispatch();
  const route = useRoute<RouteProp<LoggedInParamList>>();
  const navigation = useNavigation<NavigationProp<LoggedInParamList>>();
  const [image, setImage] =
    useState<{uri: string; name: string; type: string}>();
  const [preview, setPreview] = useState<{uri: string}>();
  const accessToken = useSelector((state: RootState) => state.user.accessToken);
  const URL = useConfig();

  const onResponse = useCallback(async response => {
    console.log(response.width, response.height, response.exif);
    setPreview({uri: `data:${response.mime};base64,${response.data}`});
    const orientation = (response.exif as any)?.Orientation;
    console.log('orientation', orientation);
    return ImageResizer.createResizedImage(
      response.path,
      600,
      600,
      response.mime.includes('jpeg') ? 'JPEG' : 'PNG',
      100,
      0,
    ).then(r => {
      console.log(r.uri, r.name);

      setImage({
        uri: r.uri,
        name: r.name,
        type: response.mime,
      });
    });
  }, []);

  const onTakePhoto = useCallback(() => {
    return ImagePicker.openCamera({
      includeBase64: true, // 미리보기 보시를 위해
      includeExif: true, // 찍은 핸드폰 방향에 맞춰서 사진이 자동으로 회전해줌
      cropping: true,
      // saveToPhotos: true,
    })
      .then(onResponse)
      .catch(console.log);
  }, [onResponse]);

  const onChangeFile = useCallback(() => {
    return ImagePicker.openPicker({
      includeExif: true,
      includeBase64: true,
      mediaType: 'photo',
    })
      .then(onResponse)
      .catch(console.log);
  }, [onResponse]);

  const orderId = route.params?.orderId;
  const onComplete = useCallback(async () => {
    if (!image) {
      Alert.alert('알림', '파일을 업로드해주세요.');
      return;
    }
    if (!orderId) {
      Alert.alert('알림', '유효하지 않은 주문입니다.');
      return;
    }
    const formData = new FormData();
    formData.append('image', image);
    formData.append('orderId', orderId);
    try {
      await axios({
        url: `${URL}/complete`,
        method: 'POST',
        data: formData,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      Alert.alert('알림', '완료처리 되었습니다.');
      navigation.goBack();
      navigation.navigate('Settings');
      dispatch(orderSlice.actions.rejectOrder(orderId));
    } catch (error) {
      const errorResponse = (error as AxiosError).response;
      if (errorResponse) {
        Alert.alert('알림', errorResponse.data.message);
      }
    }
  }, [image, orderId, URL, accessToken, navigation, dispatch]);

  return (
    <SafeAreaView>
      <OrderId>
        <Text>주문번호: {orderId}</Text>
      </OrderId>
      <Preview>{preview && <PreviewImage source={preview} />}</Preview>
      <ButtonWrapper>
        <Button onPress={onTakePhoto}>
          <ButtonText>이미지 촬영</ButtonText>
        </Button>
        <Button onPress={onChangeFile}>
          <ButtonText>이미지 선택</ButtonText>
        </Button>
        <Button onPress={onComplete} disabled={image ? false : true}>
          <ButtonText>완료</ButtonText>
        </Button>
      </ButtonWrapper>
    </SafeAreaView>
  );
}

export default Complete;
