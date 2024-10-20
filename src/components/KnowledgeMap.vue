<template>
  <div ref="graphContainer" class="graph-container">
    <!-- Heading for the knowledge map -->
    <div class="graph">
      <div>
        <h1 class="knowledge-map-heading">Robotics Knowledge Map</h1>
      </div>
      <div>
        <svg ref="svg"></svg>
      </div>
    </div>
    <!-- Card Component for displaying node details -->
    <CardComponent
      :heading="selectedNodeName"
      :imageUrl="selectedNodeImage"
      :description="selectedNodeDescription"
      :children="selectedNodeChildren"
      :showImage="selectedNode?.main"
      :isVisible="cardVisible"
    />
  </div>
</template>

<script>
import * as d3 from "d3";
import CardComponent from "./CardComponent.vue";
import { nodes, links, images, descriptions } from "@/utils/constants.js";

export default {
  name: "KnowledgeMap",
  components: { CardComponent },
  data() {
    return {
      nodes,
      links,
      isSimulationActive: false,
      simulation: null,
      blurEffectActive: false,
      selectedNode: null, // Store the selected node
      selectedNodeName: "",
      selectedNodeImage: "",
      selectedNodeDescription: "",
      selectedNodeChildren: [],
      cardVisible: false, // Control the card visibility
    };
  },
  mounted() {
    this.createGraph();
    window.addEventListener("resize", this.resizeGraph);
    document.addEventListener("click", this.handleOutsideClick);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.resizeGraph);
    document.removeEventListener("click", this.handleOutsideClick);
    if (this.simulation) {
      this.simulation.stop();
    }
  },

  methods: {
    setInitialPositions(nodes, width, height) {
      // Position nodes in a circular layout around the center
      nodes.forEach((node, index) => {
        const angle = (Math.PI + index) / nodes.length;
        node.x = width + 100 * Math.cos(angle);
        node.y = height + 100 * Math.sin(angle);
      });
    },

    updateLabels(node, link) {
      const padding = 10;

      const isColliding = (textNode) => {
        const bbox = textNode.getBBox();
        return node.some((otherNode) => {
          if (otherNode === textNode) return false; // Skip self
          const otherBbox = otherNode.getBBox();
          return !(
            bbox.x > otherBbox.x + otherBbox.width + padding ||
            bbox.x + bbox.width < otherBbox.x - padding ||
            bbox.y > otherBbox.y + otherBbox.height + padding ||
            bbox.y + bbox.height < otherBbox.y - padding
          );
        });
      };

      // Iterate over each text element
      link.selectAll("text").each(function () {
        const textNode = this; // Reference to the current text node
        // Check for collisions
        if (isColliding(textNode)) {
          // Adjust the position or style of the text node if needed
          d3.select(textNode).style("opacity", 0); // Example action: hide if colliding
        } else {
          d3.select(textNode).style("opacity", 1); // Show if not colliding
        }
      });
    },

    createGraph() {
      const svg = d3.select(this.$refs.svg);
      svg.selectAll("*").remove();
      const { nodes, links } = this;
      const width = window.innerWidth;
      const height = window.innerHeight;

      svg
        .attr("width", width)
        .attr("height", height)
        .style("background-color", "#121212");

      svg.call(this.dragSvg(svg));

      this.setInitialPositions(nodes, width / 2, height);

      // Adjust attraction forces: shorter distance for parent nodes, longer for child nodes
      const linkDistance = (d) => {
        const isParentLink = d.source.main && d.target.main;
        const isChildLink =
          (d.source.main && !d.target.main) ||
          (!d.source.main && d.target.main);
        return isParentLink ? 210 : isChildLink ? 100 : 90;
      };

      // Start the simulation immediately
      const simulation = d3
        .forceSimulation(nodes)
        .force(
          "link",
          d3
            .forceLink(links)
            .id((d) => d.id)
            .distance(linkDistance)
        )
        .force(
          "charge",
          d3.forceManyBody().strength((d) => (d.main ? -300 : -300))
        )
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(60))
        .force("x", d3.forceX(width / 2).strength(0.05))
        .force("y", d3.forceY(height / 2).strength(0.05))
        .alphaDecay(0.01);

      this.simulation = simulation;

      const link = svg
        .append("g")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", (d) => (d.source.main && d.target.main ? 2.8 : 1))
        .attr("stroke", (d) => {
          // Check if both source and target are parent nodes
          if (d.source.main && d.target.main) {
            return "#4A6FA5"; // Edge color between two parent nodes
          }
          // Check if one is a parent and the other is a child
          if (
            (d.source.main && !d.target.main) ||
            (!d.source.main && d.target.main)
          ) {
            return "#FFC857"; // Edge color between parent and child
          }
          return "orange"; // Default edge color
        });

      const node = svg
        .append("g")
        .selectAll("g")
        .data(nodes)
        .join("g")
        .call(this.drag(simulation));

      node
        .append("circle")
        .attr("r", (d) => (d.main ? 8 * 1.5 : 8))

        .attr("fill", (d) => {
          // Check if the node is a parent and if it has any connections
          const hasConnections = this.links.some(
            (link) => link.source.id === d.id || link.target.id === d.id
          );
          if (d.main && !hasConnections) {
            return "#6A0572"; // Color for parent nodes with no connections
          }
          return d.main ? "#00ADB5" : "#FF6F61"; // Parent or child node color
        })

        .attr("stroke", "black")
        .attr("stroke-width", 1.5)
        .on("click", (event, d) => this.selectNode(d, node, link));

      node
        .filter(
          (d) => d.main && !this.links.some((link) => link.source.id === d.id)
        )
        .append("circle")
        .attr("r", 3) // Radius for the inner dot
        .attr("fill", "red");

      node
        .append("text")
        .attr("x", 20)
        .attr("y", 3)
        .text((d) => d.name)
        .style("font-size", (d) => (d.main ? "18px" : "12px"))
        .style("font-weight", (d) => (d.main ? "bold" : "normal"))
        .style("fill", "white");

      simulation.on("tick", () => {
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);

        node.attr("transform", (d) => `translate(${d.x},${d.y})`);

        const padding = 20;
        nodes.forEach((d) => {
          if (d.x < padding) {
            d.vx += (padding - d.x) * 0.2; // Increase the force towards the center
          } else if (d.x > width - padding) {
            d.vx -= (d.x - (width - padding)) * 0.2;
          }
          if (d.y < padding) {
            d.vy += (padding - d.y) * 0.2;
          } else if (d.y > height - padding) {
            d.vy -= (d.y - (height - padding)) * 0.2;
          }
        });
      });
    },

    dragSvg(svg) {
      let dx = 0,
        dy = 0; // Store translation values
      let currentTransform = [0, 0];
      return d3
        .drag()
        .on("start", function (event) {
          dx = event.x;
          dy = event.y;

          const transform = svg.attr("transform");
          if (transform) {
            const translateValues = transform.match(
              /translate\(([^,]+),([^)]+)\)/
            );
            if (translateValues) {
              currentTransform = [
                parseFloat(translateValues[1]),
                parseFloat(translateValues[2]),
              ];
            }
          }
        })
        .on("drag", function (event) {
          const newTranslateX = currentTransform[0] + (event.x - dx);
          const newTranslateY = currentTransform[1] + (event.y - dy);

          // Apply the new transform
          svg.attr(
            "transform",
            `translate(${newTranslateX}, ${newTranslateY})`
          );
        });
    },

    drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
        this.updateLabels(d3.selectAll("g"), d3.selectAll("line"));
        this.selectNode(event.subject, d3.selectAll("g"), d3.selectAll("line"));
      }

      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
        this.updateLabels(d3.selectAll("g"), d3.selectAll("line"));
      }

      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
        this.resetBlurEffects();
        this.blurEffectActive = false;
      }

      return d3
        .drag()
        .on("start", dragstarted.bind(this))
        .on("drag", dragged.bind(this))
        .on("end", dragended.bind(this));
    },

    selectNode(d, node, link) {
      // Check if the node has children
      const hasChildren = this.links.some((link) => link.source.id === d.id);
      // Find the parent link if it exists
      const parentLink = this.links.find((link) => link.target.id === d.id);

      if (!hasChildren) {
        // If the node has no children, blur all other nodes
        node
          .selectAll("circle")
          .attr("opacity", (n) =>
            n.id === d.id || (parentLink && n.id === parentLink.source.id)
              ? 1
              : 0.3
          )
          .style("filter", (n) =>
            n.id === d.id || (parentLink && n.id === parentLink.source.id)
              ? "none"
              : "blur(2.1px)"
          );

        node
          .selectAll("text")
          .style("filter", (n) =>
            n.id === d.id || (parentLink && n.id === parentLink.source.id)
              ? "none"
              : "blur(2.1px)"
          );
        // Ensure the parent node's text remains unblurred
        if (parentLink) {
          const parentNodeId = parentLink.source.id;
          node
            .selectAll("text")
            .style("filter", (n) =>
              n.id === parentNodeId
                ? "none"
                : n.id === d.id
                ? "none"
                : "blur(2.1px)"
            );
        }

        link
          .attr("stroke-opacity", (l) => {
            // Keep the parent link fully visible
            if (
              parentLink &&
              l.source.id === parentLink.source.id &&
              l.target.id === parentLink.target.id
            ) {
              return 1;
            }
            return 0.3;
          })

          .style("filter", (l) => {
            // Don't blur the parent link
            if (
              parentLink &&
              l.source.id === parentLink.source.id &&
              l.target.id === parentLink.target.id
            ) {
              return "none";
            }
            return "blur(2.1px)";
          });
      } else {
        // The original blur logic when the node has children

        const connectedNodes = new Set();

        this.links.forEach((link) => {
          if (link.source.id === d.id) {
            connectedNodes.add(link.target.id); // Child nodes
          }
          if (link.target.id === d.id) {
            connectedNodes.add(link.source.id); // Parent nodes
          }
        });

        node
          .selectAll("circle")
          .attr("opacity", (n) => {
            if (n.id === d.id || connectedNodes.has(n.id)) {
              return 1;
            }
            return 0.3;
          })
          .style("filter", (n) => {
            if (n.id === d.id || connectedNodes.has(n.id)) {
              return "none";
            }
            return "blur(2.1px)";
          });

        node.selectAll("text").style("filter", (n) => {
          if (n.id === d.id || connectedNodes.has(n.id)) {
            return "none";
          }
          return "blur(2.1px)";
        });

        link
          .attr("stroke-opacity", (l) => {
            if (
              l.source.id === d.id ||
              l.target.id === d.id ||
              connectedNodes.has(l.target.id) ||
              connectedNodes.has(l.source.id)
            ) {
              return 1;
            }
            return 0.3;
          })
          .style("filter", (l) => {
            if (
              l.source.id === d.id ||
              l.target.id === d.id ||
              connectedNodes.has(l.target.id) ||
              connectedNodes.has(l.source.id)
            ) {
              return "none";
            }
            return "blur(2.1px)";
          });
      }

      this.blurEffectActive = true;

      if (!this.isSimulationActive) {
        this.simulation.alpha(0.1).restart();
        this.isSimulationActive = true;
      }

      if (d.main || d.id <= 14) {
        // For nodes where `main: true` or ID <= 14, show image and description
        this.selectedNode = d;
        this.selectedNodeName = d.name;
        this.selectedNodeImage = this.getImageForNode(d); // Only show image for main nodes
        this.selectedNodeDescription = this.generateDescription(d); // Show description

        // Find child nodes
        const childNodes = this.links
          .filter((link) => link.source.id === d.id)
          .map((link) => this.nodes.find((node) => node.id === link.target.id));
        this.selectedNodeChildren = childNodes;

        // Show the card for any selected node
        this.cardVisible = true;
      } else if (d.id > 14) {
        // For nodes with ID > 14 (not main), show description without image
        this.selectedNode = d;
        this.selectedNodeName = d.name;
        this.selectedNodeImage = ""; // No image for child nodes
        this.selectedNodeDescription = this.generateDescription(d);

        // Find child nodes
        const childNodes = this.links
          .filter((link) => link.source.id === d.id)
          .map((link) => this.nodes.find((node) => node.id === link.target.id));
        this.selectedNodeChildren = childNodes;

        // Show the card for non-main nodes as well
        this.cardVisible = true;
      } else {
        // In case no valid node is selected, hide the card
        this.cardVisible = false;
      }
    },

    handleOutsideClick(event) {
      const nodes = this.$refs.svg.querySelectorAll("circle");
      const card = this.$refs.card;

      let clickedOnNode = false;
      let clickedOnCard = card && card.contains(event.target);
      nodes.forEach((node) => {
        if (node.contains(event.target)) {
          clickedOnNode = true;
        }
      });

      if (this.blurEffectActive && !clickedOnNode) {
        console.log("Click detected outside nodes, resetting blur effects");
        this.resetBlurEffects(); // Reset all styles if blur effect is active
        this.blurEffectActive = false; // Reset blur effect flag
      }
      if (!clickedOnCard && !clickedOnNode) {
        this.cardVisible = false; // Hide the card if clicking outside
      }
    },

    resetBlurEffects() {
      // Reset nodes and links to their default styles
      const svg = d3.select(this.$refs.svg);
      svg.selectAll("circle").attr("opacity", 1).style("filter", "none");
      svg.selectAll("text").style("filter", "none");
      svg.selectAll("line").attr("stroke-opacity", 1).style("filter", "none");
    },

    resizeGraph() {
      this.createGraph();
    },

    getImageForNode(node) {
      return images[node?.id] || "";
    },

    generateDescription(node) {
      return descriptions[node.id] || "No description available.";
    },
  },
};
</script>

<style scoped src="../styles/KnowledgeMap.css"></style>
