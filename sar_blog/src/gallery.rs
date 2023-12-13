use crate::post::PostService;

pub type GalleryService<'s> = PostService<'s, model::ExhibitContent>;
