import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
export default function BottomNavigation() {
    const router = useRouter();
    const pathname = usePathname();
    const color = (rota: string) =>
        pathname === rota ? "#33C8FF" : "#8B8B9B";
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.item}
                onPress={() => router.replace("/")}
            >
                <Ionicons name="home" size={27} color={color("/")} />
                <Text style={[styles.text, { color: color("/") }]}>
                    Início
                </Text>
                {pathname === "/" && <View style={styles.activeLine} />}
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.item}
                onPress={() => router.replace("/")}
            >
                <Ionicons
                    name="time-outline"
                    size={27}
                    color={color("/historico")}
                />
                <Text style={[styles.text, { color: color("/historico") }]}>
                    Histórico
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.item}
                onPress={() => router.replace("/relogio2")}
            >
                <MaterialIcons
                    name="bar-chart"
                    size={27}
                    color={color("/insights")}
                />
                <Text style={[styles.text, { color: color("/relogio2") }]}>
                    Insights
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.item}
                onPress={() => router.replace("/")}
            >
                <Ionicons
                    name="settings-outline"
                    size={27}
                    color={color("/configuracoes")}
                />
                <Text style={[styles.text, { color: color("/configuracoes") }]}>
                    Config.
                </Text>
            </TouchableOpacity>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
        height: 82,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#0B0E18",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        elevation: 20,
        zIndex: 999,
    },
    item: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        marginTop: 5,
        fontSize: 12,
        fontWeight: "600",
    },
    activeLine: {
        position: "absolute",
        bottom: 6,
        width: 35,
        height: 3,
        backgroundColor: "#33C8FF",
        borderRadius: 20,
    }
});