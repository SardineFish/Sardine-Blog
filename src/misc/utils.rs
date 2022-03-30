
pub trait EmptyAsNone<T> {
    fn empty_as_none(self) -> Option<T>;
}

impl EmptyAsNone<String> for String {
    fn empty_as_none(self) -> Option<String> {
        if self.is_empty() {
            None
        } else {
            Some(self)
        }
    }
}

impl EmptyAsNone<String> for Option<String> {
    fn empty_as_none(self) -> Option<String> {
        match self {
            Some(str) if str.is_empty() => None,
            Some(str) => Some(str),
            None => None
        }
    }
}

impl<'s> EmptyAsNone<&'s String> for Option<&'s String> {
    fn empty_as_none(self) -> Option<&'s String> {
        match self {
            Some(str) if str.is_empty() => None,
            Some(str) => Some(str),
            None => None
        }
    }
}

#[macro_export]
macro_rules! map {
    ($($k: expr => $v: expr),* $(,)?) => {
        std::iter::Iterator::collect(std::array::IntoIter::new([$(($k.into(), $v.into())),*]))
    };
}