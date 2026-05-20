#include "GeometryBuilder.h"
#include <filament/RenderableManager.h>
#include <utils/EntityManager.h>
#include <cstddef>

struct Vertex {
    float position[2];
    float uv[2];
};

void GeometryBuilder::buildQuad(
    filament::Engine& engine,
    filament::VertexBuffer*& outVertexBuffer,
    filament::IndexBuffer*& outIndexBuffer
) {
    static const Vertex vertices[4] = {
        {{ -1.0f, -1.0f }, { 0.0f, 0.0f }},
        {{  1.0f, -1.0f }, { 1.0f, 0.0f }},
        {{ -1.0f,  1.0f }, { 0.0f, 1.0f }},
        {{  1.0f,  1.0f }, { 1.0f, 1.0f }}
    };
    
    static const uint16_t indices[6] = {
        0, 1, 2,
        2, 1, 3
    };
    
    outVertexBuffer = filament::VertexBuffer::Builder()
        .vertexCount(4)
        .bufferCount(1)
        .attribute(filament::VertexAttribute::POSITION, 0, filament::VertexBuffer::AttributeType::FLOAT2, offsetof(Vertex, position), sizeof(Vertex))
        .attribute(filament::VertexAttribute::UV0, 0, filament::VertexBuffer::AttributeType::FLOAT2, offsetof(Vertex, uv), sizeof(Vertex))
        .build(engine);
        
    outVertexBuffer->setBufferAt(engine, 0, filament::VertexBuffer::BufferDescriptor(vertices, sizeof(vertices)));
    
    outIndexBuffer = filament::IndexBuffer::Builder()
        .indexCount(6)
        .bufferType(filament::IndexBuffer::IndexType::USHORT)
        .build(engine);
        
    outIndexBuffer->setBuffer(engine, filament::IndexBuffer::BufferDescriptor(indices, sizeof(indices)));
}

utils::Entity GeometryBuilder::createQuadEntity(
    filament::Engine& engine,
    filament::VertexBuffer* vertexBuffer,
    filament::IndexBuffer* indexBuffer,
    filament::MaterialInstance* materialInstance
) {
    utils::Entity entity = utils::EntityManager::get().create();
    filament::RenderableManager::Builder(1)
        .boundingBox({{ 0, 0, 0 }, { 1, 1, 1 }})
        .material(0, materialInstance)
        .geometry(0, filament::RenderableManager::PrimitiveType::TRIANGLES, vertexBuffer, indexBuffer, 0, 6)
        .culling(false)
        .build(engine, entity);
    return entity;
}
