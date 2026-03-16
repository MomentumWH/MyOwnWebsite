<template>
  <div class="loadingImgBox">
    <aside class="container-loader">
      <article
        style="--color: #ff6347; --i: 12px; --d: 3.4s"
        class="ball"
      />
      <article
        style="--color: #00ced1; --i: 18px; --d: 6.1s"
        class="ball"
      />
      <article
        style="--color: #adff2f; --i: 10px; --d: 2.9s"
        class="ball"
      />
      <article
        style="--color: #9370db; --i: 16px; --d: 7.8s"
        class="ball"
      />
      <article
        style="--color: #ff1493; --i: 14px; --d: 4.6s"
        class="ball"
      />
      <article
        style="--color: #00bfff; --i: 11px; --d: 3.3s"
        class="ball"
      />
      <article
        style="--color: #7fff00; --i: 17px; --d: 5.5s"
        class="ball"
      />
      <article
        style="--color: #dc143c; --i: 13px; --d: 6.7s"
        class="ball"
      />
      <article
        style="--color: #8a2be2; --i: 19px; --d: 8.2s"
        class="ball"
      />
      <article
        style="--color: #48d1cc; --i: 15px; --d: 9.1s"
        class="ball"
      />
      <article
        style="--color: #ff4500; --i: 14px; --d: 4.2s"
        class="ball"
      />
      <article
        style="--color: #00ff7f; --i: 16px; --d: 5.8s"
        class="ball"
      />
      <article
        style="--color: #ba55d3; --i: 10px; --d: 7.3s"
        class="ball"
      />
      <article
        style="--color: #1e90ff; --i: 18px; --d: 6.4s"
        class="ball"
      />
      <article style="--color: #ffa500; --i: 20px; --d: 10s" class="ball" />
      <article
        style="--color: #ff69b4; --i: 12px; --d: 3.7s"
        class="ball"
      />
      <article
        style="--color: #00fa9a; --i: 11px; --d: 2.6s"
        class="ball"
      />
      <article
        style="--color: #9400d3; --i: 17px; --d: 6.9s"
        class="ball"
      />
      <article
        style="--color: #ffb6c1; --i: 13px; --d: 5.3s"
        class="ball"
      />
      <article
        style="--color: #20b2aa; --i: 19px; --d: 7.7s"
        class="ball"
      />
    </aside>
  </div>
</template>

<style scoped>
.loadingImgBox{
  position: fixed;
  top: 40%;
  left: 50%;

}
.container-loader {
  --size: 333px;
  width: var(--size);
  height: var(--size);
  position: relative;
  zoom: 0.5;
  transform: translateX(-50%);

  .ball {
    position: absolute;
    width: calc(var(--size) + var(--i));
    height: calc(var(--size) + var(--i));
    background-color: var(--color);
    border-radius: 50%;
    animation: move 5s linear infinite;
    transform-origin: var(--size);
    mix-blend-mode: hard-light;
    animation-duration: var(--d);
    filter: blur(58px);

    &:nth-child(even) {
      animation-direction: reverse;
    }
  }
}

@keyframes move {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(359deg);
  }
}
</style>
