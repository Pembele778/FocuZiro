import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import BottomNavigation from '../components/BotomN';
const screenWidth = Dimensions.get('window').width

type Foco = {
    id: string
    titulo: string
    duracao_planejada: number
    tempo_focado: number
    concluido: boolean
    data: string
}

export default function App2() {

    const [focos, setFocos] = useState<Foco[]>([])
    const [dataHoras, setDataHoras] = useState<number[]>([0, 0, 0, 0, 0])

    useEffect(() => {
        carregarDados()
    }, [])

    async function carregarDados() {
        const dados = await AsyncStorage.getItem('historico_focos')
        const lista: Foco[] = dados ? JSON.parse(dados) : []

        setFocos(lista)
        gerarGrafico(lista)
    }

    function gerarGrafico(lista: Foco[]) {
        const hoje = new Date()
        let resultado = [0, 0, 0, 0, 0]

        for (let i = 4; i >= 0; i--) {
            const dia = new Date()
            dia.setDate(hoje.getDate() - i)

            const totalDia = lista
                .filter(f => {
                    const d = new Date(f.data)
                    return d.toDateString() === dia.toDateString() && f.concluido
                })
                .reduce((acc, f) => acc + f.tempo_focado, 0)

            resultado[4 - i] = totalDia
        }

        setDataHoras(resultado)
    }


    const totalMin = focos.reduce((acc, f) => acc + f.tempo_focado, 0)
    const totalHoras = (totalMin / 60).toFixed(1)

    const concluidos = focos.filter(f => f.concluido).length
    const total = focos.length

    const taxa = total > 0 ? Math.round((concluidos / total) * 100) : 0


    function calcularStreak(lista: Foco[]) {
        let streak = 0
        let hoje = new Date()

        while (true) {
            const temFoco = lista.some(f => {
                const d = new Date(f.data)
                return d.toDateString() === hoje.toDateString() && f.concluido
            })

            if (!temFoco) break

            streak++
            hoje.setDate(hoje.getDate() - 1)
        }

        return streak
    }

    const streak = calcularStreak(focos)

    function formatarData(dataISO: string) {
        const d = new Date(dataISO)
        return d.toLocaleDateString()
    }

    const focosConcluidos = focos.filter(f => f.concluido)
    const focosInterrompidos = focos.filter(f => !f.concluido)

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>

                <Text style={styles.title}>Dashboard</Text>


                <View style={styles.row}>

                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>Tempo</Text>
                        <Text style={styles.cardValue}>{totalHoras}h</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>Sessões</Text>
                        <Text style={styles.cardValue}>{total}</Text>
                    </View>

                </View>

                <View style={styles.row}>

                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>Sucesso</Text>
                        <Text style={styles.cardValue}>{taxa}%</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>Streak 🔥</Text>
                        <Text style={styles.cardValue}>{streak}º dia</Text>
                    </View>

                </View>

                {/* 🔥 GRÁFICO */}
                <View style={styles.chartBox}>
                    <LineChart
                        data={{
                            labels: ['-4d', '-3d', '-2d', '-1d', 'Hoje'],
                            datasets: [{ data: dataHoras }]
                        }}
                        width={screenWidth - 40}
                        height={220}
                        yAxisSuffix="m"
                        chartConfig={{
                            backgroundColor: '#111',
                            backgroundGradientFrom: '#111',
                            backgroundGradientTo: '#111',
                            decimalPlaces: 0,
                            color: () => '#E63946',
                            labelColor: () => '#888',
                            propsForDots: {
                                r: '5',
                                strokeWidth: '2',
                                stroke: '#E63946'
                            },
                            propsForBackgroundLines: {
                                stroke: '#222'
                            },
                        }}
                        bezier
                        style={{ borderRadius: 16 }}
                    />
                </View>

                {/* ✅ CONCLUÍDOS */}
                <Text style={styles.section}>Concluídos</Text>
                {focosConcluidos.map(f => (
                    <View key={f.id} style={styles.item}>
                        <Text style={styles.itemTitle}>{f.titulo}</Text>
                        <Text style={styles.itemSub}>
                            {f.tempo_focado} min • {formatarData(f.data)}
                        </Text>
                    </View>
                ))}

                {/* ❌ INTERROMPIDOS */}
                <Text style={styles.section}>Interrompidos</Text>
                {focosInterrompidos.map(f => (
                    <View key={f.id} style={styles.item}>
                        <Text style={styles.itemTitle}>{f.titulo}</Text>
                        <Text style={styles.itemSub}>
                            {f.tempo_focado} min • {formatarData(f.data)}
                        </Text>
                    </View>
                ))}

            </ScrollView>
            <BottomNavigation />
        </View>
    )
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#0B0B0B',
        padding: 20,
    },

    title: {
        color: '#E63946',
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 20,
        marginTop: 40,
    },

    row: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },

    card: {
        flex: 1,
        backgroundColor: '#161616',
        padding: 15,
        borderRadius: 14,
    },

    cardLabel: {
        color: '#888',
        fontSize: 12,
    },

    cardValue: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 5,
    },

    chartBox: {
        marginTop: 20,
        marginBottom: 20,
        backgroundColor: '#161616',
        padding: 10,
        borderRadius: 16,
    },

    section: {
        color: '#fff',
        fontSize: 18,
        marginTop: 20,
        marginBottom: 10,
        fontWeight: '600',
    },

    item: {
        backgroundColor: '#161616',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },

    itemTitle: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },

    itemSub: {
        color: '#888',
        fontSize: 12,
        marginTop: 3,
    },

})