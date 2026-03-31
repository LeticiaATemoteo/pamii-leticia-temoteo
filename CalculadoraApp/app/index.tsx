import React, { useState } from 'react'; // State -> estado
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
// Set atribui valores a variáveis, useState é um hook que permite adicionar estado a componentes funcionais em React. 
// Ele retorna um par: o estado atual e uma função que permite atualizá-lo. O estado é mantido entre renderizações do 
// componente, permitindo que ele "lembre" informações ao longo do tempo. No contexto de uma calculadora, useState é 
// usado para armazenar a expressão atual e o resultado, permitindo que a interface do usuário seja atualizada
// dinamicamente com base nas interações do usuário.
interface BotaoProps { // define a interface para as propriedades do botão - objeto
  titulo: string; // obrigatório
  corFundo?: string; // se tem ? é opcional
  corTexto?: string;
}

export default function Index() { // componente principal da calculadora
  const [expressao, setExpressao] = useState<string>(''); // armazena a expressão atual - le
  const [resultado, setResultado] = useState<string>('0'); // armazena o resultado atual - atribui

  const operadores = ['+', '-', 'x', '÷', '.']; // array de operadores

  const linhasDeBotoes = [ // array multidimensional que define a disposição dos botões na calculadora
    ['C', '(', ')', '÷'],
    ['7', '8', '9', 'x'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '⌫', '=']
  ];

  const obterCorFundo = (botao: string): string => { // define as cores dos botões com base em seu tipo
    if (botao === 'C') return '#ff3b30';
    if (botao === '=') return '#34c759';
    if (['÷', 'x', '-', '+'].includes(botao)) return '#ff9500';
    if (['(', ')', '⌫'].includes(botao)) return '#555555';
    return '#333333';
  };

  const lidarComToque = (valor: string): void => { // lógica para lidar com o toque nos botões
    if (valor === 'C') { // limpa a expressão e o resultado
      setExpressao(''); 
      setResultado('0'); // numéro que aparece no display quando a calculadora é limpa
    } else if (valor === '⌫') { // remove o último caractere da expressão
      const novaExpressao = expressao.slice(0, -1); // navega na array e remove o último caractere da expressão atual
      setExpressao(novaExpressao); 
      setResultado(novaExpressao.length > 0 ? novaExpressao : '0'); 
    } else if (valor === '=') { // calcula o resultado da expressão
      try { // substitui os símbolos de multiplicação e divisão pelos equivalentes do JavaScript
        const expressaoFormatada = expressao.replace(/x/g, '*').replace(/÷/g, '/'); // substitui os símbolos de multiplicação e divisão pelos equivalentes do JavaScript
        const resultadoCalculado = eval(expressaoFormatada); // avalia a expressão formatada

        setResultado(String(resultadoCalculado)); 
        setExpressao(String(resultadoCalculado)); 
      } catch (e) {
        setResultado('Erro'); // exibe "Erro" se a expressão for inválida
      }
    } else {
      if (operadores.includes(valor)) { // validação para evitar operadores consecutivos ou iniciar a expressão com um operador
        if (expressao === '' && valor !== '-') return; 

        const ultimoCaractere = expressao.slice(-1); 

        if (operadores.includes(ultimoCaractere)) { 
          const novaExpressao = expressao.slice(0, -1) + valor;
          setExpressao(novaExpressao);
          setResultado(novaExpressao);
          return;
        }
      }

      const novaExpressao = expressao + valor; // adiciona o valor tocado à expressão atual
      setExpressao(novaExpressao);
      setResultado(novaExpressao);
    }
  };

  const Botao: React.FC<BotaoProps> = ({ titulo, corFundo = "#333333", corTexto = "#ffffff" }) => ( // componente para renderizar cada botão da calculadora
    <TouchableOpacity // componente de toque para cada botão
      style={[styles.botao, { backgroundColor: corFundo }]}
      onPress={() => lidarComToque(titulo)}
    >
      <Text style={[styles.textoBotao, { color: corTexto }]}>{titulo}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}> 
      <View style={styles.displayContainer}>
        <Text style={styles.textoDisplay} numberOfLines={1} adjustsFontSizeToFit>
          {resultado}
        </Text>
      </View>

      <View style={styles.tecladoContainer}> 
        {linhasDeBotoes.map((linha, indexLinha) => ( 
          <View key={indexLinha} style={styles.linha}>
            {linha.map((botao) => (
              <Botao
                key={botao}
                titulo={botao}
                corFundo={obterCorFundo(botao)}
              />
            ))}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  displayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 20,
  },
  textoDisplay: {
    fontSize: 70,
    color: '#ffffff',
    fontWeight: '300',
  },
  tecladoContainer: {
    paddingBottom: 30,
    paddingHorizontal: 10,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  botao: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoBotao: {
    fontSize: 32,
    fontWeight: '400',
  },
});