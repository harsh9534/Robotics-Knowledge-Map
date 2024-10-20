<template>
  <div id="particles-container" class="particles-container">
    <div class="centered-content">
      <h1 class="intro-text">
        Are you ready to take a tour of the robotics knowledge map
        <span class="blinking">?</span>
      </h1>
      <div class="explore-container">
        <button @click="goToMap" class="explore-button">
          Explore
          <i class="fas fa-location-arrow"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ParticlesComponent",
  mounted() {
    this.initializeParticles();
  },
  methods: {
    initializeParticles() {
      if (window.particlesJS) {
        // Load particles.json from the public folder
        window.particlesJS.load(
          "particles-container",
          "/particles.json",
          function () {
            console.log("callback - particles.js config loaded");
          }
        );
      }
      fetch("/particles.json")
        .then((response) => response.json())
        .then((data) => {
          if (window.particlesJS) {
            window.particlesJS("particles-container", data);
          }
        });
    },
    goToMap() {
      this.$router.push("/knowledge");
    },
  },
};
</script>

<style scoped src="../styles/ParticlesComponent.css"></style>
