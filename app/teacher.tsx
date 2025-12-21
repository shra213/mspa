import { StyleSheet, Text, View } from 'react-native';

export default function Student() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Student Login Screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold' },
});
