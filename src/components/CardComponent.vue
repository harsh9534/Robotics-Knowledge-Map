<template>
  <div v-if="isVisible" class="card-container">
    <!-- Animate the entire card's appearance and disappearance -->
    <transition name="fade-slide-card" mode="out-in">
      <div class="card-content" :key="selectedNodeId">
        <h2>{{ heading }}</h2>
        <div v-if="showImage && imageUrl" class="image-container">
          <img :src="imageUrl" alt="Node Image" />
        </div>
        <p>{{ description }}</p>
        <div v-if="filteredChildren && filteredChildren.length">
          <h3>Subjects:</h3>
          <ul class="child-list">
            <li
              v-for="child in filteredChildren"
              :key="child.id"
              class="child-item"
            >
              {{ child.name }}
            </li>
          </ul>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  props: {
    heading: String,
    imageUrl: String,
    description: String,
    children: Array,
    showImage: Boolean,
    isVisible: Boolean,
    selectedNodeId: Number, // Pass the selected node's ID to control behavior
  },
  computed: {
    // Computed property to filter children
    filteredChildren() {
      return this.children.filter((child) => {
        // Filter out any name starting with a number
        return !/^\d/.test(child.name);
      });
    },
  },
};
</script>

<style scoped src="../styles/CardComponent.css"></style>
