#pragma once
#include <filament/Engine.h>
#include <filament/VertexBuffer.h>
#include <filament/IndexBuffer.h>
#include <utils/Entity.h>

class GeometryBuilder {
public:
    static void buildQuad(
        filament::Engine& engine,
        filament::VertexBuffer*& outVertexBuffer,
        filament::IndexBuffer*& outIndexBuffer
    );

    static utils::Entity createQuadEntity(
        filament::Engine& engine,
        filament::VertexBuffer* vertexBuffer,
        filament::IndexBuffer* indexBuffer,
        filament::MaterialInstance* materialInstance
    );
};
