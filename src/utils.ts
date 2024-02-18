import * as THREE from "three";

/**
 * 
 * @param {string} url - Path to the texture, could be a locally imported image or a remote url
 * @returns {Promise<THREE.Texture>}
 * 
 * @Usage
 * ```
 * const tex = await loadTexture(ImageUrl)
 * tex.colorSpace = THREE.SRGBColorSpace
 * const cube = new THREE.Mesh(
 *     new THREE.PlaneGeometry(),
 *     new THREE.MeshBasicMaterial({ map: tex })
 * )
 * ```
 */
export const loadTexture = async (url: string): Promise<THREE.Texture> => {
    let textureLoader = new THREE.TextureLoader();
    return new Promise(resolve => {
        textureLoader.load(url, texture => {
            resolve(texture)
        })
    })
}