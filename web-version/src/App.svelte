<script>
  function ok() {}
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
    width: 25%;
    height: 60%;
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

  input {
    width: 90%;
    font-size: 1.5rem;
    margin: 2rem 0;
  }

  button {
    width: 3rem;
    height: 2rem;
  }
</style>

<div id="corpo">
  <div id="conteudo">
    <h3>Insira o título abaixo e pressione OK:</h3>
    <input type="text" />
    <button on:click={ok}>OK</button>
  </div>
</div>
