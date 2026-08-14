import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from 'react';
import {
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View
} from 'react-native';

import Svg, {
    Circle,
    Defs,
    Stop,
    LinearGradient as SvgGradient
} from 'react-native-svg';

import * as Haptics from 'expo-haptics';

export default function LockScreen() {

    const [tempoRestante, setTempoRestante] = useState<number | null>(null);
    const [tempoTotal, setTempoTotal] = useState<number>(1);

    const [titulo, setTitulo] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [codigo, setCodigo] = useState("");

    const intervalRef = useRef<any>(null);
    const tempoInicialRef = useRef<number>(0);

    // 🔥 SALVAR FOCO
    const salvarFoco = async (foco: any) => {
        try {
            const dados = await AsyncStorage.getItem('historico_focos');
            const lista = dados ? JSON.parse(dados) : [];

            lista.push(foco);

            await AsyncStorage.setItem('historico_focos', JSON.stringify(lista));
        } catch (e) {
            console.log('Erro ao salvar foco', e);
        }
    };

    useEffect(() => {
        carregarFoco();

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    async function carregarFoco() {
        try {
            const data = await AsyncStorage.getItem("foco_ativo");

            if (!data) {
                router.replace("/");
                return;
            }

            const foco = JSON.parse(data);

            if (!foco?.endValue || !foco?.startValue) {
                router.replace("/");
                return;
            }

            const total = Number(foco.endValue) - Number(foco.startValue);

            tempoInicialRef.current = total;

            setTempoTotal(total);
            setTitulo(foco.title || "Sessão de Foco");

            intervalRef.current = setInterval(() => {
                const agora = Date.now();
                const end = Number(foco.endValue);
                const restante = end - agora;

                if (restante <= 0) {
                    clearInterval(intervalRef.current);

                    finalizarFoco(true); // ✅ concluído

                } else {
                    setTempoRestante(restante);
                }
            }, 1000);

        } catch (err) {
            router.replace("/");
        }
    }

    // 🔥 FINALIZAR FOCO
    async function finalizarFoco(concluido: boolean) {

        Haptics.notificationAsync(
            concluido
                ? Haptics.NotificationFeedbackType.Success
                : Haptics.NotificationFeedbackType.Warning
        );

        const tempoRestanteAtual = tempoRestante ?? 0;

        const tempoFocado =
            tempoInicialRef.current - tempoRestanteAtual;

        const focoFinal = {
            id: Date.now().toString(),
            titulo: titulo,
            duracao_planejada: Math.floor(tempoInicialRef.current / 60000),
            tempo_focado: Math.floor(tempoFocado / 60000),
            concluido: concluido,
            data: new Date().toISOString(),
        };

        await salvarFoco(focoFinal);

        await AsyncStorage.removeItem("foco_ativo");

        router.replace('/relogio2');
    }

    function formatarTempo(ms: number | null) {
        if (ms === null) return "--:--:--";

        const total = Math.floor(ms / 1000);
        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        const s = total % 60;

        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function verificarCodigo() {
        if (codigo === "123456") {

            setModalVisible(false);

            finalizarFoco(false); // ❌ interrompido

        } else {

            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
            );

            Vibration.vibrate([100, 50, 100]);
            setCodigo("");
        }
    }

    // 🔴 CÍRCULO
    const radius = 110;
    const circumference = 2 * Math.PI * radius;

    const progress =
        tempoRestante !== null
            ? Math.min(1, Math.max(0, 1 - tempoRestante / tempoTotal))
            : 0;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <Text style={styles.lock}>🔒 MODO FOCO ATIVO</Text>
            <Text style={styles.title}>{titulo}</Text>

            <View style={styles.circleContainer}>
                <Svg width={260} height={260}>
                    <Defs>
                        <SvgGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor="#ff3b3b" />
                            <Stop offset="100%" stopColor="#ff0000" />
                        </SvgGradient>
                    </Defs>

                    <Circle
                        stroke="#222"
                        fill="none"
                        cx="130"
                        cy="130"
                        r={radius}
                        strokeWidth="12"
                    />

                    <Circle
                        stroke="url(#grad)"
                        fill="none"
                        cx="130"
                        cy="130"
                        r={radius}
                        strokeWidth="14"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - progress)}
                        strokeLinecap="round"
                        rotation="-90"
                        origin="130,130"
                    />
                </Svg>

                <View style={styles.circleContent}>
                    <Text style={styles.timer}>
                        {formatarTempo(tempoRestante)}
                    </Text>
                </View>
            </View>

            <Text style={styles.sub}>
                Mantenha o foco. O acesso está limitado.
            </Text>

            <View style={styles.buttonsContainer}>

                <TouchableOpacity style={styles.cardBtn} activeOpacity={0.7}>
                    <View style={styles.iconCircleRed}>
                        <Text>🚨</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>Emergência</Text>
                        <Text style={styles.cardDesc}>
                            Acesso rápido para situações urgentes
                        </Text>
                    </View>

                    <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cardBtn}
                    activeOpacity={0.7}
                    onPress={() => setModalVisible(true)}
                >
                    <View style={styles.iconCircle}>
                        <Text>⛔</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>Interromper</Text>
                        <Text style={styles.cardDesc}>
                            Encerrar sessão com código
                        </Text>
                    </View>

                    <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>

            </View>

            <Modal transparent animationType="fade" visible={modalVisible}>
                <View style={styles.modalOverlay}>
                    <View style={styles.card}>

                        <Text style={styles.cardTitle}>
                            Código de Segurança
                        </Text>

                        <Text style={styles.cardSub}>
                            Digite o código de 6 dígitos
                        </Text>

                        <TextInput
                            style={styles.input}
                            keyboardType="number-pad"
                            maxLength={6}
                            value={codigo}
                            onChangeText={setCodigo}
                            placeholder="******"
                            placeholderTextColor="#555"
                        />

                        <TouchableOpacity
                            style={styles.confirmBtn}
                            onPress={verificarCodigo}
                        >
                            <Text style={styles.btnText}>Confirmar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text style={styles.cancel}>Cancelar</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>

        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#030303',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },

    lock: {
        color: '#ff3b3b',
        fontSize: 12,
        letterSpacing: 3,
        marginBottom: 10,
    },

    title: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 25,
        textAlign: 'center',
    },

    circleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#ff3b3b',
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 20,
    },

    circleContent: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },

    timer: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#fff',
    },

    sub: {
        color: '#888',
        fontSize: 14,
        marginBottom: 30,
    },

    buttonsContainer: {
        width: '100%',
        gap: 15,
    },

    cardBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0d0d0d',
        padding: 18,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#222',
        gap: 15,
    },

    iconCircle: {
        width: 45,
        height: 45,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#555',
        justifyContent: 'center',
        alignItems: 'center',
    },

    iconCircleRed: {
        width: 45,
        height: 45,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#ff3b3b',
        justifyContent: 'center',
        alignItems: 'center',
    },

    cardTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },

    cardDesc: {
        color: '#777',
        fontSize: 12,
        marginTop: 3,
    },

    arrow: {
        color: '#555',
        fontSize: 22,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    card: {
        width: '85%',
        backgroundColor: '#0d0d0d',
        padding: 25,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#222',
    },

    cardSub: {
        color: '#888',
        fontSize: 13,
        marginBottom: 20,
    },

    input: {
        width: '100%',
        backgroundColor: '#111',
        borderRadius: 10,
        padding: 15,
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        letterSpacing: 5,
        marginBottom: 20,
    },

    confirmBtn: {
        backgroundColor: '#ff3b3b',
        width: '100%',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },

    btnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },

    cancel: {
        color: '#777',
        marginTop: 5,
    }
});