#version 330 core
in vec2 TexCoords;

out vec4 FragColor;

struct Material {
    float gloss;

	sampler2D diffTex;
};

uniform Material material;

void main()
{
	vec3 texColor = vec3(texture(material.diffTex, TexCoords));

    FragColor = vec4(texColor, 1.0);
}