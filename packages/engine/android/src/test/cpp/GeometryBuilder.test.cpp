#include <gtest/gtest.h>
#include "pipeline/GeometryBuilder.h"
#include <filament/Engine.h>
#include <filament/VertexBuffer.h>
#include <filament/IndexBuffer.h>
#include <utils/Entity.h>

TEST(GeometryBuilderTest, BuildQuadAndCreateEntity) {
    filament::Engine* engine = filament::Engine::create(filament::Engine::Backend::NOOP);
    ASSERT_NE(engine, nullptr);

    filament::VertexBuffer* vb = nullptr;
    filament::IndexBuffer* ib = nullptr;
    GeometryBuilder::buildQuad(*engine, vb, ib);

    ASSERT_NE(vb, nullptr);
    ASSERT_NE(ib, nullptr);

    EXPECT_EQ(vb->getVertexCount(), 4);
    EXPECT_EQ(ib->getIndexCount(), 6);

    utils::Entity entity = GeometryBuilder::createQuadEntity(*engine, vb, ib, nullptr);
    EXPECT_FALSE(entity.isNull());

    // Clean up
    engine->destroy(entity);
    engine->destroy(vb);
    engine->destroy(ib);

    filament::Engine::destroy(&engine);
}
