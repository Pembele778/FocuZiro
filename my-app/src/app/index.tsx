import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    AppState,
    BackHandler,
    Dimensions,
    ImageBackground,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import BottomNavigation from '../components/BotomN';

const { height } = Dimensions.get('window');

export default function Home() {
    const [focos, setFocos] = useState<any[]>([]);
    const [menuVisible, setMenuVisible] = useState(false);
    const [bloqueado, setBloqueado] = useState(false);

    async function verificarTempoGlobal() {
        try {
            const focoAtivoStr = await AsyncStorage.getItem("foco_ativo");
            if (!focoAtivoStr) {
                setBloqueado(false);
                return;
            }

            const focoAtivo = JSON.parse(focoAtivoStr);
            const agora = new Date().getTime();

            const tempoInicio = focoAtivo.startValue || new Date(focoAtivo.start).getTime();
            const tempoTermino = focoAtivo.endValue || new Date(focoAtivo.end).getTime();

            if (isNaN(tempoInicio) || isNaN(tempoTermino)) return;

            // terminou → limpa
            if (agora >= tempoTermino) {
                await AsyncStorage.removeItem("foco_ativo");
                setBloqueado(false);
                return;
            }

            // dentro do período → bloqueia
            if (agora >= tempoInicio && agora < tempoTermino) {
                setBloqueado(true);

                try {
                    router.replace("/bloqueio");
                } catch {
                    router.push("/bloqueio");
                }
            } else {
                setBloqueado(false);
            }

        } catch (error) {
            console.log("Erro no monitor de tempo:", error);
        }
    }

    async function load() {
        try {
            const dat = await AsyncStorage.getItem("focos");
            setFocos(dat ? JSON.parse(dat) : []);

            await verificarTempoGlobal();
        } catch (error) {
            console.error(error);
        }
    }

    // App volta do background
    useEffect(() => {
        const sub = AppState.addEventListener("change", (state) => {
            if (state === "active") {
                verificarTempoGlobal();
            }
        });

        return () => sub.remove();
    }, []);

    // bloquear botão voltar (SEM ASYNC)
    useEffect(() => {
        const backAction = () => {
            if (bloqueado) {
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, [bloqueado]);

    useFocusEffect(
        useCallback(() => {
            load();

            verificarTempoGlobal();

            const monitorInterval = setInterval(() => {
                verificarTempoGlobal();
            }, 2000);

            return () => clearInterval(monitorInterval);
        }, [])
    );

    function verDetalhes(item: any, index: number) {
        router.push({
            pathname: "/relogio3",
            params: { edit: JSON.stringify({ item, index }) }
        });
    }

    async function limparTodosOsDados() {
        Alert.alert(
            "Apagar Dados",
            "Tem certeza que deseja apagar todos os protocolos de foco salvos?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Apagar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem("focos");
                            await AsyncStorage.removeItem("foco_ativo");
                            setFocos([]);
                            setMenuVisible(false);
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }
            ]
        );
    }

    return (
        <ImageBackground
            source={require('../../assets/img2.png')}
            style={styles.img}
            resizeMode="cover"
        >
            <View style={styles.container}>
                <StatusBar style="light" />

                <View style={styles.header}>
                    <TouchableOpacity>
                        <Ionicons
                            name="settings-outline"
                            size={27}
                            color={'aqua'}

                        />
                    </TouchableOpacity>

                    <View style={styles.navActions}>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/relogio")}>
                            <Text style={styles.plusIcon}>+</Text>
                        </TouchableOpacity>

                        {/* <TouchableOpacity style={styles.iconBtn} onPress={() => setMenuVisible(true)}>
                            <Text style={styles.menuDots}>  ⋮  </Text>
                        </TouchableOpacity> */}
                    </View>
                </View>
                {/* <TouchableOpacity style={{ borderRadius: '50%', width: 100, height: 100, justifyContent: 'center', borderBlockColor: '#ff0000', borderWidth: 1, marginLeft: 200 }}>
                    <Text style={{ color: '#6ba80e', fontSize: 50, textAlign: 'center' }}>+</Text>
                </TouchableOpacity> */}
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {focos.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyTitle}>SISTEMA EM ESPERA</Text>
                            <View style={styles.emptyLine} />
                        </View>
                    ) : (
                        focos.map((item, index) => (
                            <LinearGradient
                                colors={['#01ffff94', '#38B6FF', '#8C4CFF', '#121214']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.gradientBorder}
                            >
                                <TouchableOpacity
                                    key={index}
                                    style={styles.megaCard}
                                    onPress={() => verDetalhes(item, index)}
                                    activeOpacity={0.}
                                >

                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardTitle}>
                                            {item.title || "Sem etiqueta"}
                                        </Text>
                                    </View>

                                    <View style={styles.timeContainer}>
                                        <View style={styles.timeBlock}>
                                            <Text style={styles.timeLabel}>Inicio</Text>
                                            <Text style={styles.timeValue}>
                                                {item.start?.split(',')[1] || item.start || "--:--"}
                                            </Text>
                                        </View>

                                        <View style={styles.timeDivider} />

                                        <View style={styles.timeBlock}>
                                            <Text style={[styles.timeLabel, { color: 'rgb(107, 17, 112)' }]}>Fim</Text>
                                            <Text style={styles.timeValue}>
                                                {item.end?.split(',')[1] || item.end || "--:--"}
                                            </Text>
                                        </View>
                                    </View>

                                </TouchableOpacity>
                            </LinearGradient>
                        ))
                    )}

                </ScrollView>


                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={menuVisible}
                    onRequestClose={() => setMenuVisible(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setMenuVisible(false)}
                    >
                        <View style={styles.modalContent}>
                            <View style={styles.modalHandle} />
                            <Text style={styles.modalTitle}>CONFIGURAÇÕES DO SISTEMA</Text>

                            <TouchableOpacity style={styles.ti} onPress={() => router.push("/relogio2")}>
                                <Text style={styles.ext}>Ver estatisticas</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.deleteButton} onPress={limparTodosOsDados}>
                                <Text style={styles.deleteButtonText}>Limpar Banco de Dados</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>
            <BottomNavigation />
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 20 },
    gradientBorder: {
        borderRadius: 28,
        padding: 0.3,
        gap: 16,

    },
    img: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 60, paddingBottom: 20, },
    brandText: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 2 },
    navActions: { flexDirection: 'row', alignItems: 'center' },
    iconBtn: { padding: 5, marginLeft: 15 },
    plusIcon: { color: '#fff', fontSize: 26, fontWeight: '300' },
    menuDots: { color: '#fff', fontSize: 20 },
    scrollContent: { paddingVertical: 20, gap: 25 },
    megaCard: {
        backgroundColor: '#0b0f1efd', borderRadius: 28, padding: 25,

        width: '100%',
        shadowColor: '#01ffff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 10,
        shadowRadius: 28,
        elevation: 5,
    },
    cardHeader: { marginBottom: 20, },
    cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
    timeContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    timeBlock: { flex: 1 },
    timeLabel: { color: '#1c4387', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 5 },
    timeValue: { color: '#fff', fontSize: 24, fontWeight: '300' },
    timeDivider: { width: 1, height: 30, backgroundColor: '#222', marginHorizontal: 20 },
    emptyContainer: { marginTop: 100, alignItems: 'center' },
    emptyTitle: { color: '#222', fontSize: 20, fontWeight: '900', letterSpacing: 5 },
    emptyLine: { width: 50, height: 2, backgroundColor: '#d6202fff', marginTop: 10 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#0F0F0F', height: height * 0.35, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, borderTopWidth: 2, borderTopColor: '#111' },
    modalHandle: { width: 40, height: 4, backgroundColor: '#222', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
    modalTitle: { color: '#444', fontSize: 12, fontWeight: '700', letterSpacing: 2, textAlign: 'center', marginBottom: 30 },
    deleteButton: { backgroundColor: '#d6202fff', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    deleteButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
    ti: {
        marginBottom: 10,
        borderColor: '#444',
        width: 295,
        height: 55,
        borderWidth: 1,
        borderRadius: 12,
        justifyContent: 'center',
    },
    ext: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

