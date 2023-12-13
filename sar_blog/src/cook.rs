use crate::post::PostService;

pub type CookService<'s> = PostService<'s, model::RecipeContent>;
