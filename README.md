# Palette

*A visual discovery platform for artists powered by AI*

## Overview:

Palette is a web application that lets users discover and curate images into personal collections, called Palettes. By leveraging **AI models for automatic tagging and semantic search**, it provides a personalized browsing experience that scales seamlessly. The platform is built with React, Firebase, and GPU-backed FastAPI services, showcasing both frontend design and backend architecture optimized for performance.

## Features:
  * Infinite Scrolling – browse large image libraries without page reloads.
  * AI Tagging & Semantic Search – powered by RAM++ and CLIP for automatic multi-label tagging and vector search.
  * Personalized Feeds – recommendations tailored to user preferences.
  * Collections (“Palettes”) – curate and organize images into themed boards.
  * User Uploads – add your own images to expand the gallery.
  * Likes & Favorites – save images for quick access and engagement.

## Demo:

<a href="https://palette-gallery.com" target="_blank"> 
   <img src="https://img.shields.io/badge/Live%20Site-Click%20Here!-brightgreen?style=for-the-badge" /> 
</a>

###### (opens in new tab)


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
- ![RunPod](https://img.shields.io/badge/RunPod-GPU%20Hosting?style=for-the-badge&labelColor=6C63FF&color=555555)
- ![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)

### AI Backend (run via RunPod GPU)
- RAM++ – multi-label image tagging  
- OpenCLIP (ViT-B/32, laion2b_s34b_b79k) – semantic embeddings for search & personalization  
