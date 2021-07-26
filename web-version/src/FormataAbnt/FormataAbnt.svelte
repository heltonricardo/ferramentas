<script>
  const hoje = new Date();

  const hojestr = `${hoje.getYear() + 1900}-${(hoje.getMonth() + 1)
    .toString()
    .padStart("2", "0")}-${hoje.getDate().toString().padStart("2", "0")}`;

  let link = "";
  let titulo = "";
  let publicacao = hojestr;
  let acesso = hojestr;
  let resultado = "";
  let show = false;
  
  function data(date) {
    const mes = {
      1: "jan.",
      2: "fev.",
      3: "mar.",
      4: "abr.",
      5: "maio",
      6: "jun.",
      7: "jul.",
      8: "ago.",
      9: "set.",
      10: "out.",
      11: "nov.",
      12: "dez.",
    };
    
    return `${Number(date.split("-")[2])} ${
      mes[Number(date.split("-")[1])]
    } ${Number(date.split("-")[0])}`;
  }
  
  function ok() {
    show = true;
    resultado.value = `${titulo}. [S. l.], ${data(
      publicacao
      )}. Disponível em: ${link}. Acesso em: ${data(acesso)}.`;
      resultado.select();
      resultado.setSelectionRange(0, 99999);
      document.execCommand("copy");
      link = "";
      titulo = "";
      publicacao = hojestr;
      acesso = hojestr;
    setTimeout(() => (show = false), 3000);
  }
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

  #sumiu {
    position: fixed;
    top: 100%;
  }

  span {
    position: fixed;
    margin-top: 22rem;
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

  <button on:click={ok}>OK</button>

  {#if show}
    <span>Copiado para a área de transferência</span>
  {/if}
</div>

<input type="text" id="sumiu" bind:this={resultado} />
