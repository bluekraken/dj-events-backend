"use strict";

const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

// Create an event with linked user
const create = async (ctx) => {
  let entity;
  if (ctx.is("multipart")) {
    const { data, files } = parseMultipartData(ctx);
    data.user = ctx.state.user.id;
    entity = await strapi.services.events.create(data, { files });
  } else {
    ctx.request.body.user = ctx.state.user.id;
    entity = await strapi.services.events.create(ctx.request.body);
  }
  return sanitizeEntity(entity, { model: strapi.models.events });
};

// Update a user event
const update = async (ctx) => {
  const { id } = ctx.params;

  let entity;

  const [events] = await strapi.services.events.find({
    id: ctx.params.id,
    "user.id": ctx.state.user.id,
  });

  if (!events) {
    return ctx.unauthorized(`You can't update this entry!`);
  }

  if (ctx.is("multipart")) {
    const { data, files } = parseMultipartData(ctx);
    entity = await strapi.services.events.update({ id }, data, {
      files,
    });
  } else {
    entity = await strapi.services.events.update({ id }, ctx.request.body);
  }

  return sanitizeEntity(entity, { model: strapi.models.events });
};

// Delete a user event
const del = async (ctx) => {
  const { id } = ctx.params;

  const [events] = await strapi.services.events.find({
    id: ctx.params.id,
    "user.id": ctx.state.user.id,
  });

  if (!events) {
    return ctx.unauthorized(`You can't delete this entry!`);
  }

  const entity = await strapi.services.events.delete({ id });
  return sanitizeEntity(entity, { model: strapi.models.events });
};

// Get events for logged-in user
const me = async (ctx) => {
  const user = ctx.state.user;

  if (!user) {
    return ctx.badRequest(null, [
      { messages: [{ id: "No authorisation header was found!" }] },
    ]);
  }

  const data = await strapi.services.events.find({ user: user.id });

  if (!data) {
    return ctx.notFound();
  }

  return sanitizeEntity(data, { model: strapi.models.events });
};

module.exports = {
  create,
  update,
  del,
  me,
};
