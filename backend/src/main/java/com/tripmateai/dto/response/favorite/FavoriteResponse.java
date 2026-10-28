package com.tripmateai.dto.response.favorite; import com.tripmateai.enums.FavoriteTargetType; public record FavoriteResponse(Long id,FavoriteTargetType targetType,Long targetId,String name) {}
