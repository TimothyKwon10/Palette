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

#### Languages

**JavaScript (Node.js)** – frontend logic, API calls, and web scraping utilities

**Python** – backend services, AI/ML pipelines

#### Frontend

**React (Vite)** – fast, component-based UI framework

**Tailwind CSS** – responsive, utility-first styling

**React Router** – client-side routing

#### Backend

**FastAPI** – lightweight Python API server

**Railway** – deployment of containerized backend services

**RunPod** – GPU acceleration for AI inference

#### Database & Cloud

**Firebase Firestore** – real-time NoSQL database

**Firebase Auth** – user authentication

**Firebase Storage** – image hosting & serving

#### AI / ML Models

**RAM++** – automatic multi-label image tagging

**OpenCLIP (ViT-B/32, laion2b_s34b_b79k)** – semantic embeddings for search & personalized feeds

#### Other Infrastructure

**Docker** – containerization (backend services & web scraper)

**Cron Jobs** – scheduled AI tagging pipeline
