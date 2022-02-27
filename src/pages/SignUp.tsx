import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useRef, useState} from 'react';
import {Alert, TextInput} from 'react-native';
import styled from 'styled-components/native';
import {RootStackParamList} from '../../App';
import DismissKeyboardView from '../components/DismissKeyboardView';

const Container = styled.SafeAreaView``;

const InputWrapper = styled.View`
  padding: 20px;
`;

const Label = styled.Text`
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 20px;
`;

const Input = styled.TextInput.attrs({
  importantForAutofill: 'yes',
  placeholderTextColor: 'gray',
})`
  padding: 5px;
  border-bottom-width: 0.3px;
`;

const ButtonZone = styled.View`
  align-items: center;
`;
const SignButton = styled.Pressable`
  margin-bottom: 10px;
  border-radius: 5px;
  padding-horizontal: 20px;
  padding-vertical: 10px;
  background-color: ${({disabled}) => (disabled ? 'gray' : 'blue')};
`;
const SignButtonText = styled.Text`
  font-size: 16px;
  color: white;
`;

type SignInScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

function SignUp({navigation}: SignInScreenProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const emailRef = useRef<TextInput | any>(null);
  const nameRef = useRef<TextInput | any>(null);
  const passwordRef = useRef<TextInput | any>(null);

  const onChangeEmail = useCallback(text => setEmail(text.trim()), []);
  const onChangeName = useCallback(text => setName(text.trim()), []);
  const onChangePassword = useCallback(text => setPassword(text.trim()), []);

  const canGoNext = email && name && password;

  const inputTypeValidation = useCallback(() => {
    if (
      !/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/.test(
        email,
      )
    ) {
      emailRef.current?.focus();
      return Alert.alert('알림', '올바른 이메일 주소가 아닙니다.');
    }
    if (!/^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[$@^!%*#?&]).{8,50}$/.test(password)) {
      passwordRef.current?.focus();
      return Alert.alert(
        '알림',
        '비밀번호는 영문,숫자,특수문자($@^!%*#?&)를 모두 포함하여 8자 이상 입력해야합니다.',
      );
    }
    return true;
  }, [email, password]);

  const onSubmit = useCallback(() => {
    if (inputTypeValidation()) {
      console.log(email, name, password);
      Alert.alert('알림', '회원가입이 완료되었습니다.');
      navigation.navigate('SignIn');
    }
  }, [inputTypeValidation, email, name, password, navigation]);

  return (
    <DismissKeyboardView>
      <Container>
        <InputWrapper>
          <Label>이메일</Label>
          <Input
            placeholder="이메일을 입력해주세요."
            value={email}
            onChangeText={onChangeEmail}
            ref={emailRef}
            onSubmitEditing={() => nameRef.current?.focus()}
            autoCompleteType="email"
            keyboardType="email-address"
            clearButtonMode="while-editing"
          />
        </InputWrapper>
        <InputWrapper>
          <Label>이름</Label>
          <Input
            placeholder="이름을 입력해주세요."
            value={name}
            onChangeText={onChangeName}
            ref={nameRef}
            onSubmitEditing={() => passwordRef.current?.focus()}
            autoCompleteType="name"
            clearButtonMode="while-editing"
          />
        </InputWrapper>
        <InputWrapper>
          <Label>비밀번호</Label>
          <Input
            placeholder="비밀번호를 입력해주세요."
            value={password}
            onChangeText={onChangePassword}
            ref={passwordRef}
            onSubmitEditing={onSubmit}
            secureTextEntry
            autoCompleteType="password"
          />
        </InputWrapper>
        <ButtonZone>
          <SignButton onPress={onSubmit} disabled={!canGoNext}>
            <SignButtonText>회원가입</SignButtonText>
          </SignButton>
        </ButtonZone>
      </Container>
    </DismissKeyboardView>
  );
}

export default SignUp;
