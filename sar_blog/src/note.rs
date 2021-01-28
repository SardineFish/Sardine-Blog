use model::Model;

pub struct NoteService<'m> {
    model: &'m Model
}

impl<'m> NoteService<'m> {
    pub fn new(model: &'m Model) -> Self {
        Self {
            model
        }
    }
}