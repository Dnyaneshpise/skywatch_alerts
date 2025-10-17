// src/components/StarfieldBackground.tsx
"use client";
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const StarfieldBackground: React.FC = () => {
    // useRef to get access to the DOM element to mount the canvas
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // --- 1. Basic Setup ---
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);

        // Use the ref'd div as the mount point for the renderer's canvas
        if (mountRef.current) {
            mountRef.current.appendChild(renderer.domElement);
        }

        camera.position.z = 5;

        // --- 2. Create the Starfield ---
        let starParticles: THREE.Points;
        const particleCount = 5000;

        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 1000;
            positions[i3 + 1] = (Math.random() - 0.5) * 1000;
            positions[i3 + 2] = (Math.random() - 0.5) * 1000;
        }

        const particlesGeometry = new THREE.BufferGeometry();
        particlesGeometry.setAttribute(
            'position',
            new THREE.BufferAttribute(positions, 3)
        );

        const particlesMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 0.8,
            sizeAttenuation: true,
        });

        starParticles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(starParticles);

        // --- 3. The Animation Loop ---
        let animationFrameId: number;

        const animateStars = () => {
            const posArray = starParticles.geometry.attributes.position.array as Float32Array;
            const flightSpeed = 2.0;

            for (let i = 0; i < particleCount; i++) {
                const zIndex = i * 3 + 2;
                posArray[zIndex] += flightSpeed;
                if (posArray[zIndex] > 500) {
                    posArray[zIndex] = -500;
                }
            }
            starParticles.geometry.attributes.position.needsUpdate = true;
        };

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            animateStars();
            starParticles.rotation.x += 0.0001;
            starParticles.rotation.y += 0.0002;
            renderer.render(scene, camera);
        };

        // --- 4. Handle Window Resizing ---
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // --- 5. Start and Cleanup ---
        animate();

        // Cleanup function to run when component unmounts
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
            // Dispose of Three.js objects to free up resources
            particlesGeometry.dispose();
            particlesMaterial.dispose();
            scene.remove(starParticles);
            renderer.dispose();
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    // This div is the container for the Three.js canvas
    // It's styled by the CSS in the next step
    return <div ref={mountRef} className="starfield-background" />;
};

export default StarfieldBackground;