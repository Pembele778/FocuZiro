import AsyncStorage from '@react-native-async-storage/async-storage';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { router } from "expo-router";
import React, { useState } from 'react';
import {
    Alert,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function CreateFocusScreen() {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [etiqueta, setEtiqueta] = useState("");

    // =========================
    // PICKER MELHORADO
    // =========================
    const showPicker = (
        currentDate: Date | null,
        setter: (d: Date) => void,
        isEndDate: boolean = false
    ) => {
        const baseDate = currentDate || new Date();

        DateTimePickerAndroid.open({
            value: baseDate,
            mode: 'date',
            is24Hour: true,
            onChange: (event, selectedDate) => {
                if (event.type === 'dismissed' || !selectedDate) return;

                DateTimePickerAndroid.open({
                    value: selectedDate,
                    mode: 'time',
                    is24Hour: true,
                    onChange: (e, time) => {
                        if (e.type === 'dismissed' || !time) return;

                        const finalDate = new Date(selectedDate);
                        finalDate.setHours(time.getHours(), time.getMinutes(), 0, 0);

                        setter(finalDate);
                    }
                });
            }
        });
    };

    // =========================
    // FORMATADOR BONITO
    // =========================
    const formatDate = (date: Date | null) => {
        if (!date) return "--:--";
        return date.toLocaleString([], {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // =========================
    // ATIVAR FOCO
    // =========================
    async function iniciarFoco() {
        if (!startDate || !endDate) {
            Alert.alert("Erro", "Defina início e término.");
            return;
        }

        if (endDate <= startDate) {
            Alert.alert("Erro", "O término deve ser depois do início.");
            return;
        }

        const agora = new Date().getTime();

        try {
            const novoFoco = {
                id: agora,

                // 🔥 ESSENCIAL PARA CRONÓMETRO FUNCIONAR
                startValue: startDate.getTime(),
                endValue: endDate.getTime(),

                // UI
                start: startDate.toLocaleString(),
                end: endDate.toLocaleString(),
                title: etiqueta || "Sessão de Foco",

                createdAt: agora
            };

            const antigos = await AsyncStorage.getItem("focos");
            let lista = antigos ? JSON.parse(antigos) : [];

            lista.push(novoFoco);

            await AsyncStorage.setItem("focos", JSON.stringify(lista));
            await AsyncStorage.setItem("foco_ativo", JSON.stringify(novoFoco));

            Alert.alert("Sucesso", "Foco ativado!");

            router.replace("/");

        } catch (e) {
            console.log(e);
            Alert.alert("Erro", "Falha ao salvar.");
        }
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.title}>Novo Foco</Text>
                <Text style={styles.subtitle}>
                    Crie uma sessão de concentração inteligente
                </Text>
            </View>

            {/* INPUT */}
            <View style={styles.card}>
                <Text style={styles.label}>TÍTULO</Text>
                <TextInput
                    placeholder="Ex: Estudar React Native"
                    placeholderTextColor="#555"
                    value={etiqueta}
                    onChangeText={setEtiqueta}
                    style={styles.input}
                />
            </View>

            {/* DATAS */}
            <View style={styles.row}>
                <TouchableOpacity
                    style={styles.timeBox}
                    onPress={() => showPicker(startDate, setStartDate)}
                >
                    <Text style={styles.smallLabel}>INÍCIO</Text>
                    <Text style={styles.timeText}>{formatDate(startDate)}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.timeBox}
                    onPress={() => showPicker(endDate, setEndDate, true)}
                >
                    <Text style={styles.smallLabel}>FIM</Text>
                    <Text style={styles.timeText}>{formatDate(endDate)}</Text>
                </TouchableOpacity>
            </View>

            {/* BOTÃO */}
            <View style={styles.e}>
                <TouchableOpacity style={styles.button} onPress={iniciarFoco}>
                    <Text style={styles.buttonText}>Ativar Foco</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Text style={styles.backBtnText}>Voltar</Text>
                </TouchableOpacity>
            </View>
            {/* <BottomNavigation /> */}
        </View>

    );
}

// =========================
// ESTILO PROFISSIONAL
// =========================
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B0B0B',
        padding: 20,
    },


    header: {
        marginTop: 60,
        marginBottom: 30,
    },

    title: {
        fontSize: 30,
        fontWeight: '700',
        color: '#fff',
    },

    subtitle: {
        color: '#777',
        marginTop: 6,
    },
    e: {
        marginTop: 210
    },

    card: {
        backgroundColor: '#111',
        padding: 15,
        marginTop: 14,
        borderRadius: 12,
        marginBottom: 30,
    },

    label: {
        color: '#888',
        fontSize: 11,
        marginBottom: 8,
    },

    input: {
        color: '#fff',
        fontSize: 18,
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 30,
    },

    timeBox: {
        flex: 1,
        backgroundColor: '#111',
        padding: 15,
        borderRadius: 12,
    },

    smallLabel: {
        color: '#666',
        fontSize: 11,
    },

    timeText: {
        color: '#fff',
        fontSize: 18,
        marginTop: 5,
    },
    backBtnText: {
        color: '#666',
        fontSize: 14,
        textAlign: 'center'
    },

    emptyLine: {
        width: 50,
        height: 2,
        backgroundColor: 'rgb(236, 17, 36)',
        marginTop: 10,
        marginBottom: 20,
    },

    button: {
        backgroundColor: 'rgb(236, 17, 36)', height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center'
    },

    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },


    backBtn: {

        padding: 20,

    },


});