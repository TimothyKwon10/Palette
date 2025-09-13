# Palette

*A visual discovery platform for artists powered by AI*

## Overview:

Palette is a visual discovery platform where users can explore, save, and organize artwork into personal collections called Palettes. The platform supports infinite scrolling feeds, user uploads, and curation features such as personalized content and likes. Powered by AI models, Palette automatically tags images and enables semantic search, so users can discover content beyond simple keyword matching.

## Features:
  * Infinite Scrolling – browse large image libraries without page reloads.
  * AI Tagging & Semantic Search – powered by RAM++ and CLIP for automatic multi-label tagging and vector search.
  * Personalized Feeds – recommendations tailored to user preferences.
  * Collections (“Palettes”) – curate and organize images into themed boards.
  * User Uploads – add your own images to expand the gallery.
  * Likes & Favorites – save images for quick access and engagement.

## Try It Now:

<p align="center">
  <a href="https://palette-gallery.com" target="_blank">
    <img src="https://img.shields.io/badge/🚀%20Click%20Here%20to%20Launch%20Palette-brightgreen?style=for-the-badge&logoColor=white" height="80">
  </a>
</p>


## Demo:

| Infinite Scroll | Semantic Search |  
|-----------------|-----------------|  
| ![](demo/scroll.gif) | ![](demo/search.gif) |  

| Collections (Palettes) | Personalized Feed |  
|-------------------------|-------------------|  
| ![](demo/palette.gif) | ![](demo/signup_feed.gif) |  

## Tech Stack:

### Built With

- ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)  
- ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)  
- ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)  
- ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)  
- ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)  
- ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)  
- ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)  
- ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)  
- ![RunPod](https://img.shields.io/badge/RunPod-6C63FF?style=for-the-badge&logoColor=white)
- ![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)

### AI Backend (run via RunPod GPU)
- RAM++ – multi-label image tagging  
- OpenCLIP (ViT-B/32, laion2b_s34b_b79k) – semantic embeddings for search & personalization  

## Road Map:

- **Improved Responsive Design** – enhance mobile layouts and touch interactions for a seamless experience across devices.
- **User Interactivity** – introduce comments on images and Palettes to foster community engagement.
- **Public Likes** – make likes visible to all users, creating social proof and helping popular content stand out.
- **Advanced Search Filters** – filter results by tags, colors, styles, or AI-generated attributes.
- **Collaborative Palettes** – allow multiple users to contribute to shared collections.

## Acknowledgments: 

The images displayed on Palette are **not owned by me** and remain the property of their respective creators and platforms. Full credit goes to the original artists and sources:  
- [ArtStation](https://www.artstation.com)  
- [Chicago Art Institute](https://www.artic.edu)  
- [Pexels](https://www.pexels.com)  
- [DeviantArt](https://www.deviantart.com)  

Palette’s AI-powered features are built using:  
- [OpenCLIP](https://github.com/mlfoundations/open_clip)  
- [RAM++](https://github.com/xinyu1205/recognize-anything)  
