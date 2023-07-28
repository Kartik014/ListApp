import React, { useEffect, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View, Modal, ActivityIndicator, AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "./Styles";

const CACHE_KEY = '@user_list_cache'
const CACHE_EXPIRATION_TIME = 45 * 60 * 1000 + new Date().getTime()

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalVisible, setDialogVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [Page, setPage] = useState(1);

    useEffect(() => {
        fetchData(Page);
    }, []);

    const handleAppStateChange = async (nextAppState) => {
        if (nextAppState === 'background') {
            const lastClosedTimeStamp = new Date().toLocaleString()
            await AsyncStorage.setItem('@app_last_closed_timestamp', lastClosedTimeStamp.toString())
        }
        else {
            await checkCacheExpiration()
        }
    }

    useEffect(() => {
        AppState.addEventListener('change', handleAppStateChange);
    }, []);

    const checkCacheExpiration = async () => {
        const lastClosedTimeStamp = await AsyncStorage.getItem('@app_last_closed_timestamp')
        if (lastClosedTimeStamp) {
            const currentTimeStamp = new Date().getTime()
            const timeSinceLastClosed = currentTimeStamp - parseInt(lastClosedTimeStamp, 10)
            if (timeSinceLastClosed >= CACHE_EXPIRATION_TIME) {
                await clearCache()
                console.log('Called')
            }
        }
    }

    useEffect(() => {
        checkCacheExpiration();
    }, []);

    const clearCache = async () => {
        try {
            await AsyncStorage.removeItem(CACHE_KEY)
        } catch (error) {
            console.error('Error clearing cache', error)
        }
    }

    const fetchData = async (pageNumber) => {
        try {
            const cacheData = await AsyncStorage.getItem(CACHE_KEY)
            if (cacheData) {
                const { data, timestamp } = JSON.parse(cacheData)
                const cachedTime = new Date(timestamp);
                const currentTime = new Date();
                const timeDifference = currentTime.getTime() - cachedTime.getTime();
                if (timeDifference < CACHE_EXPIRATION_TIME) {
                    setUsers(data)
                    setLoading(false)
                    return;
                } else {
                    await clearCache();
                }
            }
            setLoading(true)
            setRefreshing(false)
            const response = await fetch(`https://reqres.in/api/users?page=${pageNumber}&delay=3`);
            const data = await response.json();
            const updatedUsers = [...users, ...data.data];
            setUsers(updatedUsers);
            setLoading(false)

            const cacheObject = {
                data: updatedUsers,
                timestamp: new Date().getTime()
            }
            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject))
        } catch (error) {
            console.error('Error fetching data', error);
            setLoading(false)
            setRefreshing(false)
        }
    };

    const handleModalClick = (user) => {
        setSelectedUser(user);
        setDialogVisible(true);
    };

    const handleModalClose = () => {
        setSelectedUser(null);
        setDialogVisible(false);
    };

    const onEndReached = () => {
        const nextPage = Page + 1;
        setPage(nextPage)
        fetchData(nextPage)
    }

    const handleRefresh = () => {
        setRefreshing(true);
        const nextPage = Page + 1
        setPage(nextPage)
        fetchData(nextPage);
    }

    return (
        <View>
            {
                refreshing && users.length === 0 ? (
                    <View>
                        <ActivityIndicator size='large' color='white' />
                    </View>
                ) : null
            }
            <FlatList
                data={users}
                keyExtractor={(item, index) => item.id.toString() + index}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleModalClick(item)}>
                        <View style={styles.main}>
                            <View style={styles.wrapper}>
                                <Text style={styles.text}>{item.first_name} {item.last_name}</Text>
                            </View>
                            <Image source={{ uri: item.avatar }} style={styles.image} />
                        </View>
                    </TouchableOpacity>
                )}
                onEndReached={onEndReached}
                ListFooterComponent={() => {
                    return loading && users.length > 0 ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size='large' color='black' />
                        </View>
                    ) : null
                }}
                refreshing={refreshing}
                onRefresh={handleRefresh}
            />

            <Modal visible={modalVisible} animationType="fade" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>User Information</Text>
                        {selectedUser && (
                            <><View style={{ alignItems: 'center' }}>
                                <Image source={{ uri: selectedUser.avatar }} style={styles.modalImage} />
                            </View>
                                <View>
                                    <Text style={{ color: 'black' }}>Name: {selectedUser.first_name} {selectedUser.last_name}</Text>
                                    <Text style={{ color: 'black' }}>Email: {selectedUser.email}</Text>
                                    <Text style={{ color: 'black' }}>Id: {selectedUser.id}</Text>
                                </View></>
                        )}
                        <TouchableOpacity style={styles.modalCloseButton} onPress={() => handleModalClose()}>
                            <Text style={styles.modalCloseButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default UserList;
