<script>
  let campo = "";
  let indentacao = 2;
  let resultado;

  async function ok() {
    const titulo = campo.trim().toUpperCase();
    const area = 80 - indentacao;
    const texto = titulo.length + 6;
    let inicio = parseInt((area - texto) / 2);
    if (area % 2 && !titulo.length % 2) ++inicio;
    const fim = area - texto - inicio;
    const msg = `/*${"*".repeat(inicio)} ${titulo} ${"*".repeat(fim)}*/`;
    resultado.value = msg;
    await resultado.select();
    await resultado.setSelectionRange(0, 99999);
    await document.execCommand("copy");
    campo = "";
  }
</script>

<style>
  * {
    font-family: sans-serif;
  }

  #corpo {
    display: flex;
    background-color: #ddd;
    width: 100vw;
    height: 100vh;
    justify-content: center;
    align-items: center;
  }

  #conteudo {
    width: 30rem;
    height: 30rem;
    background-color: #eee;
    border-radius: 0.5rem;
    border-width: 1rem;
    border-color: blue;
    border: 0.1rem solid black;
    padding: 1rem;

    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  h3 {
    font-size: 1.2rem;
  }

  #entrada {
    width: 90%;
    font-size: 1.5rem;
    margin: 2rem 0;
    text-align: center;
  }

  #indent {
    display: flex;
    align-items: center;
    width: 45%;
    justify-content: space-between;
  }

  #controle {
    display: flex;
    align-items: center;
    width: 90%;
    justify-content: space-between;
    height: 1rem;
  }

  #indentacao {
    width: 5rem;
    font-size: 1.5rem;
    margin: 2rem 0;
    text-align: center;
  }

  button {
    width: 3rem;
    height: 2rem;
  }

  #sumiu {
    position: fixed;
    top: 100%;
  }
</style>

<div id="corpo">
  <div id="conteudo">
    <h3>Insira o título abaixo e pressione OK:</h3>

    <input id="entrada" type="text" bind:value={campo} />

    <div id="controle">
      <div id="indent">
        <label for="indentacao">Indentação:</label>
        <input id="indentacao" type="number" bind:value={indentacao} />
      </div>
      <button on:click={ok}>OK</button>
    </div>
  </div>
</div>

<input type="text" id="sumiu" bind:this={resultado} />
