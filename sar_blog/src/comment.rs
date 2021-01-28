use model::Model;

pub struct CommentService<'m> {
    model: &'m Model
}

impl<'m> CommentService<'m> {
    pub fn new(model: &'m Model) -> Self {
        Self{
            model
        }
    }
}