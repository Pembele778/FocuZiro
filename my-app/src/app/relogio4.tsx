import AsyncStorage from '@react-native-async-storage/async-storage';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from 'react';
import { Alert, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BottomNavigation from '../components/BotomN';
export default function EditarFoco() {
    // Captura os parâmetros de forma flexível. Se vier como id ou index, nós conseguimos ler.
    const params = useLocalSearchParams<{ id?: string; index?: string }>();
    const routeId = params.id || params.index;
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [etiqueta, setEtiqueta] = useState("");
    // Carrega os dados salvos assim que a tela abre
    useEffect(() => {
        async function carregarFoco() {
            try {
                console.log("ID/Index recebido na rota de edição:", routeId);

                if (routeId === undefined) {
                    Alert.alert("Erro de Parâmetro", "Não foi possível identificar qual foco editar.");
                    return;
                }
                const antigos = await AsyncStorage.getItem("focos");
                if (!antigos) return;

                const lista = JSON.parse(antigos);
                const index = parseInt(routeId, 10);
                // Validação robusta do índice na lista
                if (!isNaN(index) && index >= 0 && index < lista.length) {
                    const focoParaEditar = lista[index];
                    setEtiqueta(focoParaEditar.title);

                    const parsedStart = parseDateString(focoParaEditar.start);
                    const parsedEnd = parseDateString(focoParaEditar.end);
                    setStartDate(parsedStart);
                    setEndDate(parsedEnd);
                } else {
                    Alert.alert("Não Encontrado", "O foco selecionado não existe na base de dados.");
                    router.back();
                }
            } catch (error) {
                console.error(error);
                Alert.alert("Erro", "Não foi possível carregar os dados do foco.");
            }
        }
        carregarFoco();
    }, [routeId]);
    // Função auxiliar para converter qualquer tipo de string de data de forma segura
    function parseDateString(dateStr: string): Date | null {
        if (!dateStr) return null;
        const dateParsed = new Date(dateStr);

        if (!isNaN(dateParsed.getTime())) {
            return dateParsed;
        }

        try {
            // Caso o celular tenha salvo no formato "DD/MM/AAAA, HH:MM:SS"
            const [dataParte, horaParte] = dateStr.split(', ');
            const [dia, mes, ano] = dataParte.split('/').map(Number);
            const [horas, minutos] = horaParte.split(':').map(Number);
            return new Date(ano, mes - 1, dia, horas, minutos, 0, 0);
        } catch (e) {
            console.warn("Falha ao converter data manualmente:", dateStr);
            return new Date(); // Fallback seguro
        }
    }
    // Picker corrigido com sincronização de dia base e zeramento de segundos/milissegundos
    const showPicker = (currentDate: Date | null, setter: (d: Date) => void, isEndDate: boolean = false) => {
        const defaultDate = isEndDate && startDate ? new Date(startDate) : new Date();
        DateTimePickerAndroid.open({
            value: currentDate || defaultDate,
            mode: 'date',
            is24Hour: true,
            onChange: (event: any, selectedDate?: Date) => {
                if (event.type === 'dismissed' || !selectedDate) return;

                DateTimePickerAndroid.open({
                    value: selectedDate,
                    mode: 'time',
                    is24Hour: true,
                    onChange: (e: any, time?: Date) => {
                        if (e.type === 'dismissed' || !time) return;

                        const final = new Date(selectedDate);
                        // CORREÇÃO DOS MILISSEGUNDOS: Evita bugs ao salvar no mesmo dia
                        final.setHours(time.getHours(), time.getMinutes(), 0, 0);
                        setter(final);
                    }
                });
            }
        });
    };
    async function salvarAlteracoes() {
        if (!startDate || !endDate) {
            Alert.alert("Campos Incompletos", "Por favor, defina o intervalo de tempo.");
            return;
        }

        if (endDate.getTime() <= startDate.getTime()) {
            Alert.alert("Erro de Horário", "O término deve ser posterior ao início.");
            return;
        }
        try {
            if (routeId === undefined) return;
            const antigos = await AsyncStorage.getItem("focos");
            let lista = antigos ? JSON.parse(antigos) : [];
            const index = parseInt(routeId, 10);
            const focoAtualizado = {
                start: startDate.toLocaleString(),
                end: endDate.toLocaleString(),
                title: etiqueta || "Sessão de Foco"
            };
            if (!isNaN(index) && index >= 0 && index < lista.length) {
                lista[index] = focoAtualizado;
                await AsyncStorage.setItem("focos", JSON.stringify(lista));
                Alert.alert("Sucesso", "Protocolo de foco atualizado!");
                router.replace("/");
            } else {
                Alert.alert("Erro de Localização", "Não foi possível salvar as alterações no índice correspondente.");
            }
        } catch (error) {
            Alert.alert("Erro", "Houve um problema ao salvar as alterações.");
        }
    }
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <Text style={styles.title}>Editar Foco</Text>
                <Text style={styles.description}>Modifique as restrições do sistema abaixo.</Text>
            </View>
            <View style={styles.content}>
                <View style={styles.inputSection}>
                    <Text style={styles.label}>NOME DO EVENTO</Text>
                    <TextInput
                        placeholder="Ex: Estudo Intensivo"
                        placeholderTextColor="#444"
                        value={etiqueta}
                        onChangeText={setEtiqueta}
                        style={styles.input}
                    />
                </View>
                <View style={styles.timeSection}>
                    <View style={styles.timeColumn}>
                        <Text style={styles.label}>INÍCIO</Text>
                        <TouchableOpacity style={styles.timeButton} onPress={() => showPicker(startDate, setStartDate, false)}>
                            <Text style={startDate ? styles.timeValue : styles.timePlaceholder}>
                                {startDate ? startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.timeColumn}>
                        <Text style={styles.label}>TÉRMINO</Text>
                        <TouchableOpacity style={styles.timeButton} onPress={() => showPicker(endDate, setEndDate, true)}>
                            <Text style={endDate ? styles.timeValue : styles.timePlaceholder}>
                                {endDate ? endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.mainButton} onPress={salvarAlteracoes}>
                        <Text style={styles.mainButtonText}>Salvar Alterações</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <BottomNavigation />
        </View>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000', paddingHorizontal: 25 },
    header: { marginTop: 80, marginBottom: 40 },
    title: { fontSize: 28, fontWeight: '700', color: '#fff' },
    description: { fontSize: 14, color: '#666', marginTop: 5 },
    content: { flex: 1 },
    inputSection: { marginBottom: 40 },
    label: { fontSize: 11, fontWeight: '700', color: '#888', letterSpacing: 1, marginBottom: 10 },
    input: { fontSize: 18, color: '#fff', borderBottomWidth: 1, borderBottomColor: '#222', paddingVertical: 10 },
    timeSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0A0A0A', borderRadius: 15, padding: 20, borderWidth: 1, borderColor: '#111' },
    timeColumn: { flex: 1 },
    divider: { width: 1, height: 40, backgroundColor: '#222', marginHorizontal: 20 },
    timeButton: { marginTop: 5 },
    timeValue: { fontSize: 22, fontWeight: '600', color: '#fff' },
    timePlaceholder: { fontSize: 22, fontWeight: '600', color: '#333' },
    footer: { marginTop: 'auto', marginBottom: 50 },
    mainButton: { backgroundColor: '#d6202fff', height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    mainButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    cancelButton: { marginTop: 15, height: 50, justifyContent: 'center', alignItems: 'center' },
    cancelButtonText: { color: '#666', fontSize: 14 },
});