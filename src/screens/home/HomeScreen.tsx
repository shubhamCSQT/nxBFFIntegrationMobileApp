import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, FlatList, StatusBar } from 'react-native';
import { Box, theme } from '@/atoms';
import ContentFullSection from './contentFull/ContentFullSection';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CommonSearchHeader from '@/components/CommonSearchHeader/CommonSearchHeader';
import { getNewArrival } from '@/redux/newArrivalApi/NewArrivalApiAsyncThunk';
import config, { ENV } from '@/config';
import HomePlp from './homePlp/HomePlp';
import { getBestSellings } from '@/redux/bestSellingProductApi/BestSellingProductApiAsyncThunk';
import { getCustomerDetails } from '@/redux/profileApi/ProfileApiAsyncThunk';
import { createCustomerBasket } from '@/redux/createBasketApi/CreateBasketApiAsyncThunk';
import { getCustomerBasketApi } from '@/redux/basket/BasketApiAsyncThunk';
import { useIsUserLoggedIn } from '@/hooks/useIsUserLoggedIn';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { storage } from '@/store';

const HomeScreen = () => {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const [isLoadingNewArival, setIsloadingNewArrival] = useState(false);
  const [isLoadingBestSelling, setIsLoadingBestSelling] = useState(false);
  const { isUserLoggedIn } = useIsUserLoggedIn();
  const customerIdFromStorage = storage.getString('customerId');

  const [customerId, setCustomerId] = useState(customerIdFromStorage);

  const customerBasket = useAppSelector(
    state => state.getCustomerBasketApiSlice?.customerBasket?.data,
  );

  useEffect(() => {
    const listener = storage.addOnValueChangedListener(changedKey => {
      const newValue = storage.getString(changedKey);
      console.log(`"${changedKey}" new value: ${newValue}`);
      if (changedKey === 'customerId') {
        console.log('CUSTOMER ID CHANGED');
        setCustomerId(newValue);
      }
    });
    return () => {
      listener.remove();
      console.log('LISTENER REMOVED');
    };
  }, []);

  useEffect(() => {
    if (customerId) {
      dispatch(
        getCustomerBasketApi(`${config.cartUrl}getCustomerCart/${customerId}`),
      );
      dispatch(getCustomerDetails(`${config.cartUrl}userDetail/${customerId}`));
    }
    dispatch(
      createCustomerBasket(`${config.cartUrl}${config.createCartUrl}`),
    ).then(() => {});
  }, [isUserLoggedIn]);

  const newArrivals = useAppSelector(
    state => state?.getNewArrivalApiSlice?.newArrivals?.data,
  );

  const bestSellings = useAppSelector(
    state => state?.getBestSellingsApiSlice?.bestSellings?.data,
  );

  const ViewData = ['ContentFullSection', 'NewArrival', 'BestSelling'];

  console.log('🚀 ~ file: HomeScreen.tsx:70 ~ HomeScreen ~ ENV:', ENV);
  config.collections.newArrivals;
  console.log(
    '🚀 ~ file: HomeScreen.tsx:71 ~ HomeScreen ~ config.collections.newArrivals:',
    config.collections.newArrivals,
  );
  console.log(
    '🚀 ~ file: HomeScreen.tsx:76 ~ HomeScreen ~ config.baseUrl:',
    config.baseUrl,
  );

  useEffect(() => {
    setIsloadingNewArrival(true);
    setIsLoadingBestSelling(false);
    // dispatch(getNewArrival('sfcc/new-arrivals'));
    dispatch(getNewArrival(config.collections.newArrivals)).then(() => {
      setIsloadingNewArrival(false);
    });
    dispatch(getBestSellings(config.collections.bestSelling)).then(() => {
      setIsLoadingBestSelling(false);
    });
  }, []);

  const renderHomeItems = useCallback(
    ({ item }: any) => {
      switch (item) {
        case 'ContentFullSection':
          return <ContentFullSection />;
        case 'NewArrival':
          return (
            <HomePlp
              isLoadingNewArival={isLoadingNewArival}
              isLoadingBestSelling={isLoadingBestSelling}
              productList={newArrivals}
              listTitle={'New Arrivals'}
            />
          );
        case 'BestSelling':
          return (
            <HomePlp
              isLoadingNewArival={isLoadingNewArival}
              isLoadingBestSelling={isLoadingBestSelling}
              productList={bestSellings}
              listTitle={'Best Selling'}
            />
          );
        default:
          return <></>;
      }
    },
    [ViewData],
  );

  return (
    <Box flex={1} backgroundColor="white">
      <StatusBar animated={true} backgroundColor={theme.colors.background} />
      <CommonSearchHeader />
      <FlatList
        data={ViewData}
        renderItem={renderHomeItems}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top,
        }}
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    // marginBottom: 16,
  },
});

export default HomeScreen;
