<script>
  const hoje = new Date();

  const hojestr = `${hoje.getYear() + 1900}-${(hoje.getMonth() + 1)
    .toString()
    .padStart("2", "0")}-${hoje.getDate().toString().padStart("2", "0")}`;

  let link = "";
  let titulo = "";
  let publicacao = hojestr;
  let acesso = hojestr;
</script>

<style>
  #conteudo {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
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
  }

  label {
    font-size: 1.2rem;
  }

  input {
    width: 100%;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }

  button {
    font-size: 1.3rem;
    width: fit-content;
    align-self: center;
  }
</style>

<div id="conteudo">
  <label for="link">
    Link:
    <input type="text" id="link" bind:value={link} />
  </label>

  <label for="titulo">
    Título da página:
    <input type="text" id="titulo" bind:value={titulo} />
  </label>

  <label for="publicacao">
    Publicado em:
    <input type="date" id="publicacao" bind:value={publicacao} />
  </label>

  <label for="acesso">
    Acessado em:
    <input type="date" id="acesso" bind:value={acesso} />
  </label>

  <button>OK</button>
</div>
