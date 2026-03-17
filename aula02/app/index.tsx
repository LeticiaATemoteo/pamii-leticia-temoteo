// Importa o React e o Hook useState para controlar estados da aplicação
import React, { useState } from 'react';

// Importa componentes visuais do React Native
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Keyboard, Alert } from 'react-native';

// Importa o axios para fazer requisições HTTP para APIs
import axios from 'axios';

// Definir o tipo do dado
interface DadosClima {
  cidade: string;
  estado: string;
  temp: number;
  vento: number;
}

export default function App() {
  // Estado que guarda o CEP digitado pelo usuário
  const [cep, setCep] = useState('');

  // Estado que guarda os dados do clima
  // Pode ser do tipo DadosClima ou null (quando ainda não tem dados)
  const [dados, setDados] = useState<DadosClima | null>(null);

  // Estado que controla se está carregando (loading)
  const [loading, setLoading] = useState(false);

  // Função que consulta o clima usando o CEP
  const consultarClimaPorCEP = async () => {

    // Validação simples: CEP precisa ter 8 números
    if (cep.length !== 8) {
      Alert.alert("Erro", "O CEP deve ter 8 dígitos numéricos.");
      return;
    }

    // Ativa o loading
    setLoading(true);

    // Fecha o teclado do celular
    Keyboard.dismiss();

    try {
       // PRIMEIRA API: consulta o CEP nos correios (ViaCEP)
      const resCep = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      
      // Se o CEP não existir
      if (resCep.data.erro) {
        throw new Error("CEP não encontrado.");
      }

      // Pega cidade e estado retornados pela API
      const { localidade, uf } = resCep.data;


      // SEGUNDA API: converte cidade para latitude e longitude
      const resGeo = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(localidade)}&count=1&language=pt&format=json`
      );

      // Se não encontrou coordenadas
      if (!resGeo.data.results || resGeo.data.results.length === 0) {
        throw new Error("Não localizamos as coordenadas desta cidade.");
      }

      // Pega latitude e longitude da cidade
      const { latitude, longitude } = resGeo.data.results[0];


      // TERCEIRA API: consulta o clima usando latitude e longitude
      const resClima = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );

      // Atualiza o estado com o formato que a interface DadosClima exige
      setDados({
        cidade: localidade,
        estado: uf,
        temp: resClima.data.current_weather.temperature,
        vento: resClima.data.current_weather.windspeed
      });

    } catch (error: any) { // catch pega o erro e mostra na tela
      // O ': any' avisa ao TS que o erro pode vir de qualquer lugar
      Alert.alert("Ops!", error.message || "Erro ao conectar com os serviços.");
      setDados(null);
    } finally { // desativa o ícone de carregando, independente de ter dado certo ou errado
      setLoading(false);
    }
  };

  return ( // view o que é exibido na tela
    <View style={styles.container}>
      <Text style={styles.emoji}>☁️</Text>
      <Text style={styles.title}>Clima por CEP</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Digite o CEP (ex: 01001000)"
        value={cep}
        onChangeText={setCep} // Envia o que o usuario digita para a variavel
        keyboardType="numeric"
        maxLength={8}
      />

      <TouchableOpacity 
        style={[styles.button, loading && { opacity: 0.7 }]} 
        onPress={consultarClimaPorCEP} // só mostra a temperatura se o cep não estiver vazio
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Buscando..." : "Consultar Agora"}
        </Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />}

      {dados && !loading && (
        <View style={styles.card}>
          <Text style={styles.cidadeText}>{dados.cidade}, {dados.estado}</Text>
          <View style={styles.row}>
            <Text style={styles.tempText}>{Math.round(dados.temp)}°C</Text>
          </View>
          <Text style={styles.infoText}>💨 Vento: {dados.vento} km/h</Text>
        </View>
      )}
    </View>
  );
}

// Style para personalizar as telas
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F7FA', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 25 
  },
  emoji: { 
    fontSize: 50, 
    marginBottom: 10 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 30 
  },
  input: { 
    width: '100%', 
    height: 60, 
    backgroundColor: '#FFF', 
    borderRadius: 12, 
    paddingHorizontal: 20, 
    fontSize: 18, 
    elevation: 3, 
    marginBottom: 20
  },
  button: { 
    backgroundColor: '#007AFF', 
    width: '100%', 
    height: 60, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 5
  },
  buttonText: { 
    color: '#FFF', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  card: { 
    marginTop: 40, 
    width: '100%', 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 30, 
    alignItems: 'center', 
    borderLeftWidth: 8, 
    borderLeftColor: '#007AFF', 
    elevation: 4
  },
  row: { // Empilhar tipo coluna
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  cidadeText: { 
    fontSize: 20, 
    color: '#666', 
    fontWeight: '600' 
  },
  tempText: { 
    fontSize: 64, 
    fontWeight: 'bold', 
    color: '#333', 
    marginVertical: 10 
  },
  infoText: { 
    fontSize: 16, 
    color: '#888' 
  }
});