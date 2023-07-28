import { StyleSheet } from "react-native"
const styles = StyleSheet.create({
    main: {
        flex: 1,
        flexDirection: 'row',
        flexDirection: 'row-reverse',
        borderWidth: 2,
        borderRadius: 20,
        backgroundColor: 'white',
        margin: 20
    },
    wrapper: {
        flex: 1,
        margin: 10,
        alignItems: 'flex-start',
        padding: 15
    },
    image: {
        height: 75,
        width: 75,
        borderRadius: 80,
        margin: 10
    },
    text: {
        fontSize: 17,
        color: 'black'
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 30,
        elevation: 5
    },
    modalText: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        color:'black'
    },
    modalImage: {
        height: 100,
        width: 100,
        alignContent: 'center',
        marginBottom: 20
    },
    modalCloseButton: {
        alignSelf: "flex-end",
        marginTop: 10,
        paddingVertical: 5
    },
    modalCloseButtonText: {
        color: "blue",
        fontSize: 16,
        fontWeight: "bold"
    },
    loaderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10
    }
})

export default styles