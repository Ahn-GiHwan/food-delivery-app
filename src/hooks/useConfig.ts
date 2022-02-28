import {Platform} from 'react-native';
import Config from 'react-native-config';

const useConfig = () => {
  if (Platform.OS === 'ios') {
    return Config.API_URL_IOS;
  } else {
    return Config.API_URL_AND;
  }
};

export default useConfig;
