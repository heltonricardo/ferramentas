<script>
  import FormataAbnt from "./FormataAbnt/FormataAbnt.svelte";
  import FormataCodigo from "./FormataCodigo/FormataCodigo.svelte";

  let escolha = 1;
</script>

<style>
  * {
    font-family: sans-serif;
  }

  #corpo {
    background-color: #ddd;
    width: 100vw;
    height: 100vh;
  }

  select {
    margin: 2rem;
  }
</style>

<div id="corpo">
  <select bind:value={escolha}>
    <option value={2}>Formata Link para ABNT</option>
    <option value={1}>Gera Comentário de Código</option>
  </select>

  {#if escolha === 1}
    <FormataCodigo />
  {:else if escolha === 2}
    <FormataAbnt />
  {/if}
</div>
