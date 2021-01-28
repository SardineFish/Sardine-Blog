use model::Model;

pub struct UserService<'m> {
    model: &'m Model
}

impl<'m> UserService<'m> {
    pub fn new(model: &'m Model) -> Self{
        Self{
            model
        }
    }
}