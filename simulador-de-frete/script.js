const ORIGEM = {
    latitude: -3.78164,
    longitude: -38.57258
};



const CONFIG = {
    taxaBaseFrete: 5.00,
    valorPorKmFrete: 1.50,

    taxaBaseUber: 4.50,
    valorPorKmUber: 1.80
};




const formulario = document.getElementById("freteForm");

const campoCep = document.getElementById("cep");

const botao = document.getElementById("btnCalcular");

const mensagem = document.getElementById("mensagem");

const resultado = document.getElementById("resultado");

const endereco = document.getElementById("endereco");

const distancia = document.getElementById("distancia");

const uberMoto = document.getElementById("uberMoto");

const frete = document.getElementById("frete");




campoCep.addEventListener("input", function () {

    let cep = campoCep.value.replace(/\D/g, "");

    cep = cep.substring(0, 8);

    if (cep.length > 5) {

        cep =
            cep.substring(0, 5) +
            "-" +
            cep.substring(5);

    }

    campoCep.value = cep;

});




formulario.addEventListener("submit", async function (event) {

    event.preventDefault();


  
    const cep = campoCep.value.replace(/\D/g, "");


    if (cep.length !== 8) {

        mostrarErro("Digite um CEP válido com 8 números.");

        return;
    }


    botao.disabled = true;

    botao.textContent = "Calculando...";

    mensagem.textContent = "Consultando o CEP...";

    mensagem.classList.remove("erro");

    resultado.hidden = true;


    try {

    

        const dados = await consultarCep(cep);



        const latitudeDestino = Number(dados.lat);

        const longitudeDestino = Number(dados.lng);


        if (
            !Number.isFinite(latitudeDestino) ||
            !Number.isFinite(longitudeDestino)
        ) {

            throw new Error(
                "A API não encontrou a localização desse CEP."
            );

        }


      

        const distanciaKm = calcularDistancia(

            ORIGEM.latitude,
            ORIGEM.longitude,

            latitudeDestino,
            longitudeDestino

        );


     
        const valorUber =
            CONFIG.taxaBaseUber +
            (distanciaKm * CONFIG.valorPorKmUber);


       

        const valorFrete =
            CONFIG.taxaBaseFrete +
            (distanciaKm * CONFIG.valorPorKmFrete);


      
        exibirResultado(

            dados,
            distanciaKm,
            valorUber,
            valorFrete

        );


    } catch (erro) {

        mostrarErro(erro.message);

    }


    botao.disabled = false;

    botao.textContent = "Calcular frete";

});



async function consultarCep(cep) {

    const url =
        `https://cep.awesomeapi.com.br/json/${cep}`;


    try {

        const resposta = await fetch(url);


        if (!resposta.ok) {

            throw new Error(
                "CEP não encontrado."
            );

        }


        const dados = await resposta.json();


        if (!dados) {

            throw new Error(
                "Não foi possível obter os dados do CEP."
            );

        }


        return dados;


    } catch (erro) {

        throw new Error(
            "Não foi possível consultar o CEP. Verifique sua conexão com a internet."
        );

    }

}




function calcularDistancia(

    latitude1,
    longitude1,

    latitude2,
    longitude2

) {

    const raioTerra = 6371;


    
    const diferencaLatitude =
        grausParaRadianos(
            latitude2 - latitude1
        );


    const diferencaLongitude =
        grausParaRadianos(
            longitude2 - longitude1
        );


    const a =
        Math.sin(diferencaLatitude / 2) ** 2 +

        Math.cos(
            grausParaRadianos(latitude1)
        ) *

        Math.cos(
            grausParaRadianos(latitude2)
        ) *

        Math.sin(
            diferencaLongitude / 2
        ) ** 2;


    const c =
        2 *

        Math.atan2(

            Math.sqrt(a),

            Math.sqrt(1 - a)

        );


    return raioTerra * c;

}




function grausParaRadianos(graus) {

    return graus * (Math.PI / 180);

}




function exibirResultado(

    dados,
    distanciaKm,
    valorUber,
    valorFrete

) {

    endereco.textContent =
        `${dados.address_name}, ${dados.neighborhood} - ${dados.city}/${dados.state}`;


    distancia.textContent =
        `${distanciaKm.toFixed(2)} km`;


    uberMoto.textContent =
        formatarMoeda(valorUber);


    frete.textContent =
        formatarMoeda(valorFrete);


    mensagem.textContent =
        "Consulta realizada com sucesso!";


    mensagem.classList.remove("erro");


    resultado.hidden = false;

}




function formatarMoeda(valor) {

    return valor.toLocaleString(

        "pt-BR",

        {
            style: "currency",
            currency: "BRL"
        }

    );

}



function mostrarErro(texto) {

    mensagem.textContent = texto;

    mensagem.classList.add("erro");

    resultado.hidden = true;

}