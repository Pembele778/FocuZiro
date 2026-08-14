import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
export default function DetalhesFoco() {
    // Recupera os parâmetros enviados ao clicar no card da Home
    const params = useLocalSearchParams();

    // Converte os dados do item selecionado
    let focoItem: any = null;
    let focoIndex: number = -1;
    if (params.edit) {
        try {
            const parsed = JSON.parse(params.edit as string);
            focoItem = parsed.item;
            focoIndex = parsed.index;
        } catch (e) {
            console.log("Erro ao processar dados do foco", e);
        }
    }
    // Função para APAGAR apenas este foco específico
    async function apagarEsteFoco() {
        if (focoIndex === -1) return;
        Alert.alert(
            "Terminar Protocolo",
            "Deseja realmente apagar e encerrar este protocolo de foco?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Apagar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const dat = await AsyncStorage.getItem("focos");
                            if (dat) {
                                const listaFocos = JSON.parse(dat);
                                // Remove o item selecionado pelo index
                                listaFocos.splice(focoIndex, 1);
                                // Salva a lista atualizada de volta no armazenamento
                                await AsyncStorage.setItem("focos", JSON.stringify(listaFocos));
                                // Volta para a tela principal (Home)
                                router.replace("/");
                            }
                        } catch (error) {
                            console.log("Erro ao apagar o foco", error);
                        }
                    }
                }
            ]
        );
    }
    // Direciona para a página de edição (relogio4) levando os dados atuais
    function irParaEditar() {
        router.push({
            pathname: "/relogio4",
            params: { edit: JSON.stringify({ item: focoItem, index: focoIndex }) }
        });
    }
    // Se não houver dados válidos, mostra um aviso de erro amigável no layout
    if (!focoItem) {
        return (
            <View style={styles.container}>
                <StatusBar style="light" />
                <View style={styles.errorContainer}>
                    <Text style={styles.emptyTitle}>ERRO DE LEITURA</Text>
                    <View style={styles.emptyLine} />
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Text style={styles.backBtnText}>VOLTAR</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <View style={styles.header}>

                <Text style={styles.brandText}>DETALHES DO PROTOCOLO</Text>
                <View style={{ width: 40 }} />
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.metaCard}>
                    <Text style={styles.cardLabel}>PROTOCOLO ATIVO</Text>
                    <Text style={styles.cardTitle}>{focoItem.title || "SEM TÍTULO DEFINIDO"}</Text>
                </View>
                {/* PAINEL DE TEMPO (CRONOGRAMA) */}
                <View style={styles.timeContainer}>
                    <View style={styles.timeBlock}>
                        <Text style={styles.timeLabel}>START (INÍCIO)</Text>
                        <Text style={styles.timeValue}>{focoItem.start?.split(',')[1] || focoItem.start || "--:--"}</Text>
                        <Text style={styles.dateValue}>{focoItem.start?.split(',')[1] || ""}</Text>
                    </View>

                    <View style={styles.timeDivider} />

                    <View style={styles.timeBlock}>
                        <Text style={[styles.timeLabel, { color: '#d6202fff' }]}>END (TÉRMINO)</Text>
                        <Text style={styles.timeValue}>{focoItem.end?.split(',')[1] || "--:--"}</Text>
                        <Text style={styles.dateValue}>{focoItem.end?.split(',')[1] || ""}</Text>
                    </View>
                </View>
                {/* PAINEL ADICIONAL: STATUS DO SISTEMA */}
                <View style={styles.statusPanel}>
                    <Text style={styles.statusTitle}>STATUS DO SISTEMA</Text>
                    <View style={styles.statusRow}>
                        <Text style={styles.statusLabel}>Monitorização:</Text>
                        <View style={styles.badgeAtivo}>
                            <Text style={styles.badgeText}>EM CURSO</Text>
                        </View>
                    </View>
                    <View style={styles.statusRow}>
                        <Text style={styles.statusLabel}>ID do Bloco:</Text>
                        <Text style={styles.statusValue}>#00{focoIndex + 1}</Text>
                    </View>
                </View>
                {/* BOTÕES DE AÇÃO */}
                <View style={styles.actionsContainer}>

                    {/* BOTÃO EDITAR (DIRECIONA PARA RELOGIO4) */}
                    <TouchableOpacity style={styles.editBtn} onPress={irParaEditar} activeOpacity={0.8}>
                        <Text style={styles.editBtnText}>EDITAR PARÂMETROS</Text>
                    </TouchableOpacity>
                    {/* BOTÃO APAGAR (DESTRUTIVO) */}
                    <TouchableOpacity style={styles.deleteBtn} onPress={apagarEsteFoco} activeOpacity={0.8}>
                        <Text style={styles.deleteBtnText}>ELIMINAR FOCO</Text>
                    </TouchableOpacity>
                    {/* BOTÃO VOLTAR / FECHAR */}
                    <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.8}>
                        <Text style={styles.closeBtnText}>VOLTAR AO PAINEL PRINCIPAL</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            {/* <BottomNavigation /> */}
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#111',
        paddingBottom: 20,
    },
    backArrowBtn: {
        padding: 5,
    },
    backArrow: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    brandText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 2,
        textAlign: 'center'
    },
    scrollContent: {
        padding: 20
    },
    metaCard: {
        backgroundColor: '#0A0A0A',
        borderRadius: 10,
        padding: 25,
        borderColor: '#1A1A1A',
        borderWidth: 1,
        marginBottom: 20,
        alignItems: 'center',
    },
    cardLabel: {
        color: '#d6202fff',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 3,
        marginBottom: 8,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: 1,
        textAlign: 'center',
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#0A0A0A',
        borderRadius: 10,
        padding: 20,
        borderColor: '#1A1A1A',
        borderWidth: 1,
        marginBottom: 20,
    },
    timeBlock: {
        flex: 1,
        alignItems: 'center',
    },
    timeLabel: {
        color: '#444',
        fontSize: 10,
        fontWeight: '900',
        marginBottom: 5
    },
    timeValue: {
        color: '#fff',
        fontSize: 26,
        fontWeight: '300'
    },
    dateValue: {
        color: '#444',
        fontSize: 10,
        marginTop: 5,
    },
    timeDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#222',
        marginHorizontal: 10
    },
    statusPanel: {
        backgroundColor: '#0A0A0A',
        borderRadius: 10,
        padding: 20,
        borderColor: '#1A1A1A',
        borderWidth: 1,
        marginBottom: 30,
    },
    statusTitle: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1.5,
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#111',
        paddingBottom: 8,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusLabel: {
        color: '#555',
        fontSize: 13,
        fontWeight: 'bold',
    },
    statusValue: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'monospace',
    },
    badgeAtivo: {
        backgroundColor: '#1C1C1C',
        borderColor: '#d6202fff',
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 5,
    },
    badgeText: {
        color: '#d6202fff',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    actionsContainer: {
        gap: 15,
    },
    editBtn: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    editBtnText: {
        color: '#000',
        fontWeight: '900',
        fontSize: 14,
        letterSpacing: 1.5,
    },
    deleteBtn: {
        backgroundColor: '#120204',
        borderColor: '#d6202fff',
        borderWidth: 1,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    deleteBtnText: {
        color: '#d6202fff',
        fontWeight: '900',
        fontSize: 14,
        letterSpacing: 1.5,
    },
    closeBtn: {
        paddingVertical: 15,
        alignItems: 'center',
    },
    closeBtnText: {
        color: '#444',
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 1,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyTitle: {
        color: '#d6202fff',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 4
    },
    emptyLine: {
        width: 50,
        height: 2,
        backgroundColor: '#d6202fff',
        marginTop: 10,
        marginBottom: 20,
    },
    backBtn: {
        borderColor: '#333',
        borderWidth: 1,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 5,
    },
    backBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    }
});